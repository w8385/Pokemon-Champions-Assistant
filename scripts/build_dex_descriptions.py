#!/usr/bin/env python3
import csv
import io
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'
BASE = 'https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv'
POKEAPI = 'https://pokeapi.co/api/v2'
HEADERS = {'User-Agent': 'Mozilla/5.0 (OpenClaw dex description builder)'}

FILES = {
    'moves': 'moves.csv',
    'move_names': 'move_names.csv',
    'move_effects': 'move_effect_prose.csv',
    'abilities': 'abilities.csv',
    'ability_names': 'ability_names.csv',
    'ability_prose': 'ability_prose.csv',
    'items': 'items.csv',
    'item_names': 'item_names.csv',
    'item_prose': 'item_prose.csv',
}

LANGUAGE_MAP = {
    'ko': 'ko',
    'en': 'en',
    'ja': 'ja',
}


def fetch_csv(name: str):
    url = f"{BASE}/{FILES[name]}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        text = resp.read().decode('utf-8')
    return list(csv.DictReader(io.StringIO(text)))


def fetch_json(url: str):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def clean_text(text: str | None):
    if not text:
        return ''
    text = re.sub(r'\{[^}]+\}', '', text)
    text = re.sub(r'\[([^\]]+)\]', r'\1', text)
    text = text.replace(':   ', ': ')
    text = text.replace('\r', '')
    text = re.sub(r'\n{2,}', '\n', text)
    text = re.sub(r'\s+', ' ', text.replace('\n', ' \n ')).replace(' \n ', '\n').strip()
    return text


def parse_ts_array(source: str, const_name: str):
    m = re.search(rf'export const {const_name} = \[(.*?)\] as const', source, re.S)
    if not m:
        raise RuntimeError(f'Could not find {const_name}')
    body = m.group(1)
    return re.findall(r'"([^"]+)"', body)


def pick_latest_flavor(entries: list[dict], field: str):
    latest: dict[str, str] = {}
    for entry in entries:
        lang = entry.get('language', {}).get('name')
        text = clean_text(entry.get(field))
        if not text:
            continue
        if lang == 'ko':
            latest['ko'] = text
        elif lang == 'en':
            latest['en'] = text
        elif lang == 'ja':
            latest['ja'] = text
    return latest


def pick_effect_entries(entries: list[dict]):
    result = {'short': {}, 'long': {}}
    for entry in entries:
        lang = entry.get('language', {}).get('name')
        short = clean_text(entry.get('short_effect'))
        long = clean_text(entry.get('effect'))
        if lang == 'ko':
            if short:
                result['short']['ko'] = short
            if long:
                result['long']['ko'] = long
        elif lang == 'en':
            if short:
                result['short']['en'] = short
            if long:
                result['long']['en'] = long
        elif lang == 'ja':
            if short:
                result['short']['ja'] = short
            if long:
                result['long']['ja'] = long
    return result


def localized_text(summary: dict[str, str], detail: dict[str, str]):
    out = {}
    for lang in LANGUAGE_MAP:
        out[lang] = {
            'summary': summary.get(lang) or summary.get('en') or '',
            'detail': detail.get(lang) or summary.get(lang) or detail.get('en') or summary.get('en') or '',
        }
    return out


def first_text(*values: str):
    for value in values:
        if value:
            return value
    return ''


def main():
    champions_data = json.loads((SRC / 'pokemon_champions_verified_data.json').read_text())
    rows = champions_data['rows']
    move_meta = json.loads((SRC / 'championsLearnedMoveMeta.json').read_text())
    move_aliases = json.loads((SRC / 'championsMoveMetaNameAliases.json').read_text())
    move_name_overrides = json.loads((SRC / 'championsMoveNameOverrides.json').read_text())
    item_ts = (SRC / 'championsItems.ts').read_text()
    item_names_jp = set(parse_ts_array(item_ts, 'CHAMPIONS_ITEM_OPTIONS'))
    ability_slugs = sorted({ability for row in rows for ability in row.get('abilities', [])})
    move_names_ko = sorted(move_meta.keys())

    moves = fetch_csv('moves')
    move_names = fetch_csv('move_names')
    move_effects = fetch_csv('move_effects')
    abilities = fetch_csv('abilities')
    ability_names = fetch_csv('ability_names')
    ability_prose = fetch_csv('ability_prose')
    items = fetch_csv('items')
    item_names = fetch_csv('item_names')
    item_prose = fetch_csv('item_prose')

    move_by_id = {row['id']: row for row in moves}
    move_effect_by_id = {row['move_effect_id']: row for row in move_effects if row['local_language_id'] == '9'}
    ability_by_slug = {row['identifier']: row for row in abilities}
    ability_names_by_id = {}
    for row in ability_names:
        ability_names_by_id.setdefault(row['ability_id'], {})[row['local_language_id']] = row['name']
    ability_prose_by_id = {row['ability_id']: row for row in ability_prose if row['local_language_id'] == '9'}
    item_names_by_id = {}
    item_names_ja_to_id = {}
    for row in item_names:
        item_names_by_id.setdefault(row['item_id'], {})[row['local_language_id']] = row['name']
        if row['local_language_id'] == '1':
            item_names_ja_to_id[row['name']] = row['item_id']
    item_prose_by_id = {row['item_id']: row for row in item_prose if row['local_language_id'] == '9'}

    move_ko_to_id = {}
    move_en_by_id = {}
    move_ja_by_id = {}
    for row in move_names:
        if row['local_language_id'] == '3':
            move_ko_to_id[row['name']] = row['move_id']
        elif row['local_language_id'] == '9':
            move_en_by_id[row['move_id']] = row['name']
        elif row['local_language_id'] == '1':
            move_ja_by_id[row['move_id']] = row['name']

    for en_name, payload in move_name_overrides.items():
        ko = payload.get('ko')
        target_id = next((move_id for move_id, name in move_en_by_id.items() if name == en_name), None)
        if ko and target_id:
            move_ko_to_id.setdefault(ko, target_id)
    for alias, canonical in move_aliases.items():
        target_id = move_ko_to_id.get(canonical)
        if target_id:
            move_ko_to_id.setdefault(alias, target_id)

    output = {'moves': {}, 'abilities': {}, 'items': {}}
    missing_moves = []
    print(f'fetching localized move descriptions: {len(move_names_ko)} entries')

    for idx, ko_name in enumerate(move_names_ko, start=1):
        move_id = move_ko_to_id.get(ko_name)
        if not move_id:
            missing_moves.append(ko_name)
            continue
        if idx % 50 == 0:
            print(f'  moves {idx}/{len(move_names_ko)}')
        move_row = move_by_id.get(move_id)
        effect_row = move_effect_by_id.get(move_row['effect_id']) if move_row else None
        api = fetch_json(f'{POKEAPI}/move/{move_id}')
        flavor = pick_latest_flavor(api.get('flavor_text_entries', []), 'flavor_text')
        effects = pick_effect_entries(api.get('effect_entries', []))
        summary = {
            'ko': first_text(flavor.get('ko', '')),
            'en': first_text(effects['short'].get('en', ''), flavor.get('en', '')),
            'ja': first_text(flavor.get('ja', '')),
        }
        detail = {
            'ko': first_text(effects['long'].get('ko', ''), flavor.get('ko', '')),
            'en': first_text(effects['long'].get('en', ''), clean_text(effect_row['effect']) if effect_row else '', flavor.get('en', '')),
            'ja': first_text(effects['long'].get('ja', ''), flavor.get('ja', '')),
        }
        output['moves'][ko_name] = {
            'moveId': int(move_id),
            'nameEn': move_en_by_id.get(move_id, ''),
            'nameJa': move_ja_by_id.get(move_id, ''),
            'text': localized_text(summary, detail),
            'effectChance': int(move_row['effect_chance']) if move_row and move_row.get('effect_chance') else None,
        }

    print(f'fetching localized ability descriptions: {len(ability_slugs)} entries')
    for idx, slug in enumerate(ability_slugs, start=1):
        ability_row = ability_by_slug.get(slug)
        if not ability_row:
            continue
        if idx % 50 == 0:
            print(f'  abilities {idx}/{len(ability_slugs)}')
        ability_id = ability_row['id']
        prose = ability_prose_by_id.get(ability_id)
        names = ability_names_by_id.get(ability_id, {})
        api = fetch_json(f'{POKEAPI}/ability/{ability_id}')
        flavor = pick_latest_flavor(api.get('flavor_text_entries', []), 'flavor_text')
        effects = pick_effect_entries(api.get('effect_entries', []))
        summary = {
            'ko': first_text(flavor.get('ko', '')),
            'en': first_text(effects['short'].get('en', ''), clean_text(prose['short_effect']) if prose else '', flavor.get('en', '')),
            'ja': first_text(flavor.get('ja', '')),
        }
        detail = {
            'ko': first_text(effects['long'].get('ko', ''), flavor.get('ko', '')),
            'en': first_text(effects['long'].get('en', ''), clean_text(prose['effect']) if prose else '', flavor.get('en', '')),
            'ja': first_text(effects['long'].get('ja', ''), flavor.get('ja', '')),
        }
        output['abilities'][slug] = {
            'abilityId': int(ability_id),
            'nameKo': names.get('3', ''),
            'nameEn': names.get('9', ''),
            'nameJa': names.get('1', ''),
            'text': localized_text(summary, detail),
        }

    print(f'fetching localized item descriptions: {len(item_names_jp)} entries')
    for idx, item_jp in enumerate(sorted(item_names_jp), start=1):
        item_id = item_names_ja_to_id.get(item_jp)
        if not item_id:
            continue
        if idx % 25 == 0:
            print(f'  items {idx}/{len(item_names_jp)}')
        prose = item_prose_by_id.get(item_id)
        names = item_names_by_id.get(item_id, {})
        api = fetch_json(f'{POKEAPI}/item/{item_id}')
        flavor = pick_latest_flavor(api.get('flavor_text_entries', []), 'text')
        effects = pick_effect_entries(api.get('effect_entries', []))
        summary = {
            'ko': first_text(flavor.get('ko', '')),
            'en': first_text(effects['short'].get('en', ''), clean_text(prose['short_effect']) if prose else '', flavor.get('en', '')),
            'ja': first_text(flavor.get('ja', '')),
        }
        detail = {
            'ko': first_text(effects['long'].get('ko', ''), flavor.get('ko', '')),
            'en': first_text(effects['long'].get('en', ''), clean_text(prose['effect']) if prose else '', flavor.get('en', '')),
            'ja': first_text(effects['long'].get('ja', ''), flavor.get('ja', '')),
        }
        output['items'][item_jp] = {
            'itemId': int(item_id),
            'nameKo': names.get('3', ''),
            'nameEn': names.get('9', ''),
            'nameJa': names.get('1', item_jp),
            'text': localized_text(summary, detail),
        }

    (SRC / 'dexDescriptions.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(f'wrote {SRC / "dexDescriptions.json"}')
    print(f'moves: {len(output["moves"])}/{len(move_names_ko)} matched')
    print(f'abilities: {len(output["abilities"])}/{len(ability_slugs)} matched')
    print(f'items: {len(output["items"])}/{len(item_names_jp)} matched')
    if missing_moves:
        print('missing moves sample:', missing_moves[:20])


if __name__ == '__main__':
    main()
