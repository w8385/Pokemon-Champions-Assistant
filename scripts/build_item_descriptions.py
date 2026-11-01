#!/usr/bin/env python3
"""Offline pinned item-text producer; never assigns PokeAPI itemId to game IDs."""
import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
OUTPUT = ROOT / 'src/dexDescriptions.json'


def read_verified(path, expected):
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError(f'input hash mismatch: {path.name}')
    return json.loads(data)


def normalized(value):
    return re.sub(r'[^0-9a-z가-힣ぁ-んァ-ヶ一-龯]+', '', unicodedata.normalize('NFKC', value).lower())


def build(fixture, historical, bundle):
    records = fixture['records']
    if len(records) != 119 or len(historical) != 43 or len({r['canonicalId'] for r in records}) != 119:
        raise ValueError('unexpected canonical item population')
    if {r['canonicalId'] for r in records} & historical.keys():
        raise ValueError('historical key overlap')
    if sum(r['kind'] == 'ordinary' for r in records) != 38 or sum(r['kind'] == 'mega-stone' for r in records) != 81:
        raise ValueError('ordinary/required stone population changed')
    if len(re.findall(r'^  "[^"]+",$', (ROOT / 'src/championsItems.ts').read_text().split('] as const', 1)[0], re.M)) != 81:
        raise ValueError('ordinary registry changed; inspect mappings')
    source_ids = set()
    aliases = {}
    entries = dict(historical)
    for row in records:
        key, source_id = row['canonicalId'], row['sourceItemId']
        if source_id is None:
            raise ValueError(f'unresolved source: {key}')
        if not isinstance(source_id, int) or source_id in source_ids:
            raise ValueError(f'duplicate/invalid sourceItemId: {key}')
        source_ids.add(source_id)
        if row['sourceLabels'] != {'name': f'ITEMNAME_{source_id}', 'description': f'ITEMINFO_SYN_{source_id}'}:
            raise ValueError(f'source label mismatch: {key}')
        names, text = row['sourceNames'], row['text']
        if set(names) != {'ko', 'en', 'ja'} or set(text) != {'ko', 'en', 'ja'} or any(not names[lang] or not text[lang] for lang in names):
            raise ValueError(f'missing source label/text: {key}')
        if row['kind'] == 'ordinary' and normalized(names['ja']) != normalized(key):
            raise ValueError(f'ordinary identity mismatch: {key}')
        if row['kind'] == 'mega-stone' and normalized(names['ko']) != normalized(key) and not (key == '후딘나이트' and source_id == 679 and names == {'ko': '후디나이트', 'en': 'Alakazite', 'ja': 'フーディナイト'}):
            raise ValueError(f'unapproved stone alias: {key}')
        entries[key] = {
            'sourceItemId': source_id,
            'sourceLabels': row['sourceLabels'],
            'sourceCommit': fixture['sourceCommit'],
            'nameKo': names['ko'], 'nameEn': names['en'], 'nameJa': names['ja'],
            'text': {lang: {'summary': text[lang], 'detail': text[lang]} for lang in ('ko', 'en', 'ja')},
        }
    if len(source_ids) != 119 or len(entries) != 162:
        raise ValueError('missing text coverage changed')
    for key, entry in entries.items():
        for name in (key, entry['nameKo'], entry['nameEn'], entry['nameJa']):
            token = normalized(name)
            if not token:
                raise ValueError(f'empty alias: {key}')
            previous = aliases.setdefault(token, key)
            if previous != key:
                raise ValueError(f'alias collision: {name}: {previous} / {key}')
    # Canonical keys and historical fields survive; only missing rows are appended.
    bundle['items'] = entries
    return (json.dumps(bundle, ensure_ascii=False, indent=2) + '\n').encode()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--fixture', type=Path, default=DATA / 'item-description-primary.json')
    parser.add_argument('--manifest', type=Path, default=DATA / 'item-description-manifest.json')
    parser.add_argument('--output', type=Path, default=OUTPUT)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    fixture = read_verified(args.fixture, manifest['fixtureSha256'])
    historical = read_verified(DATA / 'item-description-historical.json', manifest['historicalSha256'])
    if fixture['sourceCommit'] != manifest['sourceCommit'] or len(manifest['primaryFiles']) != 7:
        raise ValueError('source revision/manifest mismatch')
    current = args.output.read_bytes()
    generated = build(fixture, historical, json.loads(current))
    if args.check:
        if current != generated:
            raise ValueError('stale item descriptions; run scripts/build_item_descriptions.py')
        print('item descriptions: verified offline, unchanged')
    elif current != generated:
        args.output.write_bytes(generated)
        print('item descriptions: wrote 119 primary texts; kept 43 historical rows')
    else:
        print('item descriptions: unchanged')


if __name__ == '__main__':
    main()
