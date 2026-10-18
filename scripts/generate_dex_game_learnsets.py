#!/usr/bin/env python3
"""Regenerate the Dex-only snapshot from fixed public Champions masterdata.

Run: python3 scripts/generate_dex_game_learnsets.py
Optional offline verified inputs: --source-dir DIRECTORY containing the upstream
masterdata/personal.json, masterdata/waza_learn.json, masterdata/waza.json,
rom-txt/kor/wazaname.json, parse/personal_dump.txt hierarchy. No dynamic latest
or parser move-availability union.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
SHA = '50e7233b78c3b81df29563f9695386c28e77fc95'
BASE = f'https://raw.githubusercontent.com/projectpokemon/champout/{SHA}/'
FILES = {
    'parse/personal_dump.txt': 'a5ec82c4b92ef96355b3044fad9bedd7dc22521ec1e35f0d0331e6fd07f5ec1c',
    'masterdata/personal.json': '5ab5444e4e08cc692c1c309dc0c113e8ba63e23187f9f6331cc4505db3ab96a7',
    'masterdata/waza_learn.json': 'fa40af93a85ad57b7308332e498437bed35be42c526a237b02f0af314e766b1a',
    'masterdata/waza.json': 'f6bfc143b78410ead2d69bebf52dff7ddbed9bb08bfaf7fd0ca2d28f21838ffa',
    'rom-txt/kor/wazaname.json': 'fb072eeef94204cf1f5dd97dbd6fdfc24dfbb29ad40ee739efece856e4e450a5',
}
# Verified against pinned waza.json type IDs (e.g. 74=11 grass, 779=8 steel).
SOURCE_TYPES = ('normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
                'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
                'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy')
STATS = ('hp', 'atk', 'def', 'spatk', 'spdef', 'agi')
APP_STATS = ('hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed')


def generate(source_dir=None):
    def load(path, digest):
        content = ((source_dir / path).read_bytes() if source_dir else urlopen(BASE + path, timeout=40).read())
        actual = hashlib.sha256(content).hexdigest()
        if actual != digest:
            raise ValueError(f'{path}: source SHA-256 mismatch {actual}')
        return (content.decode('utf-8-sig') if path.endswith('.txt') else json.loads(content))

    raw = {path: load(path, digest) for path, digest in FILES.items()}
    ordered_personal = sorted(raw['masterdata/personal.json'], key=lambda p: (int(p['no']), int(p['fo'])))
    names = re.findall(r'(?m)^(\d{4}) - ([^\n]+)$', raw['parse/personal_dump.txt'])
    if len(names) != len(ordered_personal) or any(int(no) != int(p['no']) for p, (no, _) in zip(ordered_personal, names)):
        raise ValueError('primary form names do not align with personal ids')
    primary_names = {p['id']: name for p, (_, name) in zip(ordered_personal, names)}
    personal = {p['id']: p for p in raw['masterdata/personal.json']}
    learn = {p['id']: [int(mid) for mid in p['waza'].split(',') if mid] for p in raw['masterdata/waza_learn.json']}
    waza = {int(p['id']): p for p in raw['masterdata/waza.json']}
    labels = {row['LabelName']: row['OriginalText'] for row in raw['rom-txt/kor/wazaname.json']['mSDataSet']}
    available = {mid for mid, entry in waza.items() if entry['available'] == '1'}
    mapped = json.loads((ROOT / 'scripts/dex_game_primary_key_map.json').read_text())
    roster = {row['key']: row for row in json.loads((ROOT / 'src/pokemon_champions_verified_data.json').read_text())['rows']}
    extras_source = (ROOT / 'src/effectiveRoster.ts').read_text()
    for block in re.findall(r'\{ id: \d+, key: .*? \},', extras_source):
        def field(name):
            found = re.search(r'\b' + name + r": '([^']+)'", block)
            return found.group(1) if found else None
        def number(name):
            found = re.search(r'\b' + name + r': (\d+)', block)
            return int(found.group(1)) if found else None
        key = field('key')
        if key in roster:
            raise ValueError(f'duplicate effective roster key: {key}')
        roster[key] = {name: number(name) for name in APP_STATS}
    if len(roster) != 341 or set(roster) != set(mapped) | {'mega-meowstic', 'tauros-paldean'}:
        raise ValueError('mapped and unresolved keys must exhaust the effective roster')
    # The nine extra roster forms live in effectiveRoster.ts. Their six-stat
    # evidence is pinned in the mapping fixture and checked against source.
    meta = json.loads((ROOT / 'src/championsLearnedMoveMeta.json').read_text())
    descriptions = json.loads((ROOT / 'src/dexDescriptions.json').read_text())['moves']
    by_id = {}
    for name, row in descriptions.items():
        mid = row.get('moveId')
        if mid is not None:
            by_id.setdefault(mid, []).append(name)
    forms = {}
    move_ids = set()
    for key, evidence in sorted(mapped.items()):
        pid = evidence['primaryId']
        p = personal[pid]
        assert pid in learn, pid
        source_stats = [int(p[field]) for field in STATS]
        if source_stats != evidence['stats']:
            raise ValueError(f'{key}: source form stat mismatch')
        if int(pid[:4]) != int(p['no']) or int(pid[4:]) != int(p['fo']):
            raise ValueError(f'{key}: source form id mismatch')
        if primary_names[pid] != evidence['primaryName']:
            raise ValueError(f'{key}: source form name mismatch')
        if source_stats != [roster[key][f] for f in APP_STATS]:
            raise ValueError(f'{key}: app roster stat mismatch')
        # Preserve the independently reviewed form-name resolution in fixture;
        # never derive a pool from shared base species or another form.
        ids = sorted(set(learn[pid]) & available)
        forms[key] = {'primaryId': pid, 'moves': ids}
        move_ids.update(ids)
    if len(forms) != 339 or len(move_ids) != 510:
        raise ValueError('unexpected roster / learned available move count')
    moves = {}
    for mid in sorted(move_ids):
        source_ko = labels[waza[mid]['ms_lbl']]
        aliases = by_id.get(mid, [])
        app_name = (source_ko if source_ko in meta else next((name for name in aliases if name in meta), source_ko))
        # Only a same-ID description is allowed as alias; otherwise retain
        # source text and unknown metadata, never fuzzy-match transliteration.
        if app_name != source_ko and app_name not in aliases:
            raise ValueError(f'{mid}: unverified alias')
        try:
            type_id = int(waza[mid]['type'])
            if not 0 <= type_id < len(SOURCE_TYPES):
                raise ValueError('out of range')
            source_type = SOURCE_TYPES[type_id]
        except (TypeError, ValueError) as exc:
            raise ValueError(f'{mid}: unknown primary type {waza[mid]["type"]}') from exc
        moves[mid] = {'sourceKo': source_ko, 'appName': app_name, 'type': source_type}
    move_index = {}
    for mid, move in moves.items():
        name = move['appName']
        if name in move_index:
            raise ValueError(f'duplicate canonical move name {name}')
        move_index[name] = {'id': mid, 'sourceKo': move['sourceKo'], 'type': move['type']}
    unresolved = {
        'mega-meowstic': {'reason': 'ambiguous-form', 'candidates': ['0678002', '0678003']},
        'tauros-paldean': {'reason': 'ambiguous-form', 'candidates': ['0128001', '0128002', '0128003']},
    }
    result = {
        'source': {'repo': 'projectpokemon/champout', 'commit': SHA, 'date': '2026-09-09',
                   'algorithm': 'waza_learn[id].waza ∩ {waza[id].available == "1"}; exact species/form id',
                   'sha256': FILES},
        'moves': moves, 'forms': forms, 'unresolved': unresolved,
    }
    target = ROOT / 'src/dexGameLearnsets.json'
    target.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + '\n')
    index_target = ROOT / 'src/dexGameMoveIndex.json'
    index_target.write_text(json.dumps(move_index, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + '\n')
    print(f'{target}: {len(forms)} mapped forms, {len(unresolved)} ambiguous, {len(moves)} available learned move IDs; {index_target}: {len(move_index)} identities')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, help='verified upstream file hierarchy (default: pinned GitHub)')
    args = parser.parse_args()
    generate(args.source_dir)
