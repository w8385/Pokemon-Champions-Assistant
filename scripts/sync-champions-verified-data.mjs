import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const verifiedDataPath = path.join(root, 'src', 'pokemon_champions_verified_data.json')
const allPokemonPath = path.resolve(root, '..', 'pokemon-data', 'pkmnchamps_allPokemon.json')
const reportPath = path.join(root, 'reports', 'championsVerifiedDataSyncReport.json')
const OFFICIAL_REGULATION_ROSTER_URL = 'https://web-view.app.pokemonchampions.jp/battle/pages/events/rs178713870219xeaaio/ja/pokemon.html'
const CURRENT_REGULATION = {
  id: 'M-C',
  startsAt: '2026-09-09T02:00:00.000Z',
  endsAt: '2026-12-02T01:59:00.000Z',
  rosterUrl: OFFICIAL_REGULATION_ROSTER_URL,
}
const CHAMPIONS_EFFORT_PER_STAT_CAP = 32
const TYPE_KO_BY_KEY = {
  normal: '노말', fire: '불꽃', water: '물', electric: '전기', grass: '풀', ice: '얼음',
  fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼', bug: '벌레',
  rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악', steel: '강철', fairy: '페어리',
}
const MANUAL_FORMS = [
  {
    key: 'persian-alolan', apiName: 'persian-alola', canonicalFormSlug: 'persian-alolan', source: 'regulation-m-c-form',
    name_ko: '페르시온 (알로라)', name_en: 'Alolan Persian', name_ja: 'ペルシアン (アローラのすがた)',
  },
  {
    key: 'toxtricity-low-key', apiName: 'toxtricity-low-key', canonicalFormSlug: 'toxtricity-low-key', source: 'regulation-m-c-form',
    name_ko: '스트린더 (로우한 모습)', name_en: 'Toxtricity (Low Key Form)', name_ja: 'ストリンダー (ローなすがた)',
  },
  {
    key: 'indeedee-female', apiName: 'indeedee-female', canonicalFormSlug: 'indeedee-female', source: 'regulation-m-c-form',
    name_ko: '에써르 (암컷의 모습)', name_en: 'Indeedee (Female)', name_ja: 'イエッサン (メスのすがた)',
  },
  {
    key: 'squawkabilly-blue-plumage', apiName: 'squawkabilly-blue-plumage', canonicalFormSlug: 'squawkabilly-blue-plumage', source: 'regulation-m-c-form',
    name_ko: '시비꼬 (블루 페더)', name_en: 'Squawkabilly (Blue Plumage)', name_ja: 'イキリンコ (ブルーフェザー)',
  },
  {
    key: 'squawkabilly-yellow-plumage', apiName: 'squawkabilly-yellow-plumage', canonicalFormSlug: 'squawkabilly-yellow-plumage', source: 'regulation-m-c-form',
    name_ko: '시비꼬 (옐로 페더)', name_en: 'Squawkabilly (Yellow Plumage)', name_ja: 'イキリンコ (イエローフェザー)',
  },
  {
    key: 'squawkabilly-white-plumage', apiName: 'squawkabilly-white-plumage', canonicalFormSlug: 'squawkabilly-white-plumage', source: 'regulation-m-c-form',
    name_ko: '시비꼬 (화이트 페더)', name_en: 'Squawkabilly (White Plumage)', name_ja: 'イキリンコ (ホワイトフェザー)',
  },
  {
    key: 'mega-absol-z', baseApiName: 'absol', canonicalFormSlug: 'mega-absol-z', source: 'regulation-m-c-mega',
    name_ko: '메가앱솔Z', name_en: 'Mega Absol Z', name_ja: 'メガアブソルZ',
    types: ['dark', 'ghost'], abilityNames: ['sharpness'], abilityNamesKo: ['예리함'],
    stats: { hp: 65, attack: 154, defense: 60, spAttack: 75, spDefense: 60, speed: 151 },
    sprite: 'https://www.serebii.net/pokemon/art/359-mz.png',
  },
  {
    key: 'mega-garchomp-z', baseApiName: 'garchomp', canonicalFormSlug: 'mega-garchomp-z', source: 'regulation-m-c-mega',
    name_ko: '메가한카리아스Z', name_en: 'Mega Garchomp Z', name_ja: 'メガガブリアスZ',
    types: ['dragon'], abilityNames: ['levitate'], abilityNamesKo: ['부유'],
    stats: { hp: 108, attack: 130, defense: 85, spAttack: 141, spDefense: 85, speed: 151 },
    sprite: 'https://www.serebii.net/pokemon/art/445-mz.png',
  },
  {
    key: 'mega-lucario-z', baseApiName: 'lucario', canonicalFormSlug: 'mega-lucario-z', source: 'regulation-m-c-mega',
    name_ko: '메가루카리오Z', name_en: 'Mega Lucario Z', name_ja: 'メガルカリオZ',
    types: ['fighting', 'steel'], abilityNames: ['aura-guard'], abilityNamesKo: ['파동의방호'],
    stats: { hp: 70, attack: 100, defense: 70, spAttack: 164, spDefense: 70, speed: 151 },
    sprite: 'https://www.serebii.net/pokemon/art/448-mz.png',
  },
  {
    key: 'mega-golisopod', baseApiName: 'golisopod', canonicalFormSlug: 'mega-golisopod', source: 'regulation-m-c-mega',
    name_ko: '메가갑주무사', name_en: 'Mega Golisopod', name_ja: 'メガグソクムシャ',
    types: ['bug', 'steel'], abilityNames: ['tough-claws'], abilityNamesKo: ['단단한발톱'],
    stats: { hp: 75, attack: 150, defense: 175, spAttack: 70, spDefense: 120, speed: 40 },
    sprite: 'https://www.serebii.net/pokemon/art/768-m.png',
  },
  {
    key: 'mega-baxcalibur', baseApiName: 'baxcalibur', canonicalFormSlug: 'mega-baxcalibur', source: 'regulation-m-c-mega',
    name_ko: '메가드닐레이브', name_en: 'Mega Baxcalibur', name_ja: 'メガセグレイブ',
    types: ['dragon', 'ice'], abilityNames: ['thermal-exchange'], abilityNamesKo: ['열교환'],
    stats: { hp: 115, attack: 175, defense: 117, spAttack: 105, spDefense: 101, speed: 87 },
    sprite: 'https://www.serebii.net/pokemon/art/998-m.png',
  },
  {
    key: 'mega-staraptor',
    apiName: 'staraptor-mega',
    canonicalFormSlug: 'mega-staraptor',
    source: 'manual-requested-form',
    name_ko: '메가찌르호크',
    name_en: 'Mega Staraptor',
    name_ja: 'メガムクホーク',
  },
  {
    key: 'mega-metagross',
    apiName: 'metagross-mega',
    canonicalFormSlug: 'mega-metagross',
    source: 'manual-season-3-mega',
    name_ko: '메가메타그로스',
    name_en: 'Mega Metagross',
    name_ja: 'メガメタグロス',
  },
  {
    key: 'mega-scolipede',
    apiName: 'scolipede-mega',
    canonicalFormSlug: 'mega-scolipede',
    source: 'manual-season-3-mega',
    name_ko: '메가펜드라',
    name_en: 'Mega Scolipede',
    name_ja: 'メガペンドラー',
  },
  {
    key: 'mega-scrafty',
    apiName: 'scrafty-mega',
    canonicalFormSlug: 'mega-scrafty',
    source: 'manual-season-3-mega',
    name_ko: '메가곤율거니',
    name_en: 'Mega Scrafty',
    name_ja: 'メガズルズキン',
  },
  {
    key: 'mega-eelektross',
    apiName: 'eelektross-mega',
    canonicalFormSlug: 'mega-eelektross',
    source: 'manual-season-3-mega',
    name_ko: '메가저리더프',
    name_en: 'Mega Eelektross',
    name_ja: 'メガシビルドン',
  },
  {
    key: 'mega-pyroar',
    apiName: 'pyroar-mega',
    canonicalFormSlug: 'mega-pyroar',
    source: 'manual-season-3-mega',
    name_ko: '메가화염레오',
    name_en: 'Mega Pyroar',
    name_ja: 'メガカエンジシ',
  },
  {
    key: 'mega-malamar',
    apiName: 'malamar-mega',
    canonicalFormSlug: 'mega-malamar',
    source: 'manual-season-3-mega',
    name_ko: '메가칼라마네로',
    name_en: 'Mega Malamar',
    name_ja: 'メガカラマネロ',
  },
  {
    key: 'mega-barbaracle',
    apiName: 'barbaracle-mega',
    canonicalFormSlug: 'mega-barbaracle',
    source: 'manual-season-3-mega',
    name_ko: '메가거북손데스',
    name_en: 'Mega Barbaracle',
    name_ja: 'メガガメノデス',
  },
  {
    key: 'mega-dragalge',
    apiName: 'dragalge-mega',
    canonicalFormSlug: 'mega-dragalge',
    source: 'manual-season-3-mega',
    name_ko: '메가드래캄',
    name_en: 'Mega Dragalge',
    name_ja: 'メガドラミドロ',
  },
  {
    key: 'mega-falinks',
    apiName: 'falinks-mega',
    canonicalFormSlug: 'mega-falinks',
    source: 'manual-season-3-mega',
    name_ko: '메가대여르',
    name_en: 'Mega Falinks',
    name_ja: 'メガタイレーツ',
  },
]

function keyFromMegaFormName(formName, fallbackBaseName) {
  if (!formName) return fallbackBaseName ? `mega-${fallbackBaseName}` : null
  const match = formName.match(/^(.*)-mega(?:-(x|y))?$/)
  if (!match) return fallbackBaseName ? `mega-${fallbackBaseName}` : null
  const [, baseName, suffix] = match
  return `mega-${baseName}${suffix ? `-${suffix}` : ''}`
}

function actualStat(base, ev, natureMultiplierValue = 1, hp = false) {
  const evContribution = Math.max(0, Math.trunc(ev))
  if (hp) return Math.floor((((2 * base + 31) * 50) / 100) + 60) + evContribution
  const raw = Math.floor((((2 * base + 31) * 50) / 100) + 5) + evContribution
  return Math.floor(raw * natureMultiplierValue)
}

function speedTemplate(base, boosted, scarf) {
  let value = actualStat(base, CHAMPIONS_EFFORT_PER_STAT_CAP, boosted ? 1.1 : 1)
  if (scarf) value = Math.floor(value * 1.5)
  return value
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.text()
}

function buildRow({ key, canonicalFormSlug, name_ko, name_en, name_ja, types, abilities, abilities_ko, stats, sprite, sprite_status, id }) {
  return {
    id,
    key,
    canonicalFormSlug,
    name_ko,
    name_en,
    name_ja,
    types,
    types_ko: types.map((type) => TYPE_KO_BY_KEY[type] ?? type),
    abilities,
    abilities_ko,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    spAttack: stats.spAttack,
    spDefense: stats.spDefense,
    speed: stats.speed,
    fast: speedTemplate(stats.speed, true, false),
    neutral: speedTemplate(stats.speed, false, false),
    uninvested: actualStat(stats.speed, 0, 1),
    scarf_fast: speedTemplate(stats.speed, true, true),
    scarf_neutral: speedTemplate(stats.speed, false, true),
    sprite,
    sprite_status,
  }
}

function canonicalForBase(nameEn) {
  return 'base'
}

function japaneseMegaName(baseJa, formName) {
  if (!baseJa) return formName
  if (formName?.endsWith('-mega-x')) return `メガ${baseJa}X`
  if (formName?.endsWith('-mega-y')) return `メガ${baseJa}Y`
  return `メガ${baseJa}`
}

async function main() {
  const verifiedData = JSON.parse(await fs.readFile(verifiedDataPath, 'utf8'))
  const allPokemon = JSON.parse(await fs.readFile(allPokemonPath, 'utf8'))

  const rosterHtml = await fetchText(OFFICIAL_REGULATION_ROSTER_URL)
  const rosterMatch = rosterHtml.match(/const pokemons = (\[[\s\S]*?\]);/)
  if (!rosterMatch) throw new Error('Failed to parse official regulation roster')
  const officialRoster = JSON.parse(rosterMatch[1])
  const currentListBaseIds = new Set(
    officialRoster
      .filter(([code]) => typeof code === 'string' && code.endsWith('-000'))
      .map(([code]) => Number(code.slice(0, 4))),
  )

  const baseEntryById = new Map(
    allPokemon
      .filter((entry) => !entry.formName)
      .map((entry) => [entry.id, entry])
  )

  const pokeApiCache = new Map()
  const abilityKoCache = new Map()

  async function getPokemonBundle(name) {
    if (pokeApiCache.has(name)) return pokeApiCache.get(name)
    const pokemon = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`)
    const species = await fetchJson(pokemon.species.url)
    const bundle = { pokemon, species }
    pokeApiCache.set(name, bundle)
    return bundle
  }

  async function getAbilityKo(name) {
    if (abilityKoCache.has(name)) return abilityKoCache.get(name)
    const detail = await fetchJson(`https://pokeapi.co/api/v2/ability/${name}`)
    const ko = detail.names.find((entry) => entry.language.name === 'ko')?.name ?? name
    abilityKoCache.set(name, ko)
    return ko
  }

  const megaCatalogEntries = allPokemon.filter((entry) => entry.isMega && entry.formName)
  const disallowedLegendaryMegaKeys = new Set()
  for (const formEntry of megaCatalogEntries) {
    const megaKey = keyFromMegaFormName(formEntry.formName, formEntry.nameEn)
    if (!megaKey) continue
    const { species } = await getPokemonBundle(formEntry.nameEn)
    if (species.is_legendary || species.is_mythical) {
      disallowedLegendaryMegaKeys.add(megaKey)
    }
  }

  const currentRows = (verifiedData.rows ?? []).filter((row) => !disallowedLegendaryMegaKeys.has(row.key))
  const currentIds = new Set(currentRows.map((row) => row.id))
  const currentKeys = new Set(currentRows.map((row) => row.key))

  async function buildBaseRow(baseEntry) {
    const apiName = ({ 849: 'toxtricity-amped', 931: 'squawkabilly-green-plumage' })[baseEntry.id] ?? baseEntry.nameEn
    const { pokemon, species } = await getPokemonBundle(apiName)
    const stats = {
      hp: baseEntry.stats.hp,
      attack: baseEntry.stats.atk,
      defense: baseEntry.stats.def,
      spAttack: baseEntry.stats.spa,
      spDefense: baseEntry.stats.spd,
      speed: baseEntry.stats.spe,
    }
    const abilities = pokemon.abilities.map((entry) => entry.ability.name)
    const abilities_ko = await Promise.all(abilities.map(getAbilityKo))
    const name_ja = species.names.find((entry) => entry.language.name === 'ja-Hrkt')?.name
      ?? species.names.find((entry) => entry.language.name === 'ja')?.name
      ?? baseEntry.nameEn
    return buildRow({
      id: pokemon.id,
      key: baseEntry.nameEn,
      canonicalFormSlug: canonicalForBase(baseEntry.nameEn),
      name_ko: baseEntry.nameKo,
      name_en: baseEntry.nameEn.charAt(0).toUpperCase() + baseEntry.nameEn.slice(1),
      name_ja,
      types: baseEntry.types,
      abilities,
      abilities_ko,
      stats,
      sprite: pokemon.sprites.other['official-artwork'].front_default,
      sprite_status: 'pokeapi-official-artwork',
    })
  }

  async function buildManualFormRow(config) {
    const { pokemon } = await getPokemonBundle(config.apiName ?? config.baseApiName ?? config.key)
    const statsByName = Object.fromEntries(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]))
    const abilities = config.abilityNames?.length
      ? config.abilityNames
      : pokemon.abilities.map((entry) => entry.ability.name)
    const abilities_ko = config.abilityNamesKo?.length
      ? config.abilityNamesKo
      : await Promise.all(abilities.map(getAbilityKo))
    return buildRow({
      id: pokemon.id,
      key: config.key,
      canonicalFormSlug: config.canonicalFormSlug,
      name_ko: config.name_ko,
      name_en: config.name_en,
      name_ja: config.name_ja,
      types: config.types ?? pokemon.types.map((entry) => entry.type.name),
      abilities,
      abilities_ko,
      stats: config.stats ?? {
        hp: statsByName.hp,
        attack: statsByName.attack,
        defense: statsByName.defense,
        spAttack: statsByName['special-attack'],
        spDefense: statsByName['special-defense'],
        speed: statsByName.speed,
      },
      sprite: config.sprite ?? pokemon.sprites.other['official-artwork'].front_default,
      sprite_status: config.sprite ? 'regulation-m-c-verified-artwork' : 'pokeapi-official-artwork',
    })
  }

  async function buildMegaCatalogRow(formEntry) {
    const apiName = formEntry.formName ?? `${formEntry.nameEn}-mega`
    const { pokemon, species } = await getPokemonBundle(apiName)
    const stats = formEntry.stats
      ? {
          hp: formEntry.stats.hp,
          attack: formEntry.stats.atk,
          defense: formEntry.stats.def,
          spAttack: formEntry.stats.spa,
          spDefense: formEntry.stats.spd,
          speed: formEntry.stats.spe,
        }
      : Object.fromEntries(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]))
    const abilities = pokemon.abilities.map((entry) => entry.ability.name)
    const abilities_ko = await Promise.all(abilities.map(getAbilityKo))
    const baseJa = species.names.find((entry) => entry.language.name === 'ja-Hrkt')?.name
      ?? species.names.find((entry) => entry.language.name === 'ja')?.name
      ?? formEntry.nameEn
    const key = keyFromMegaFormName(formEntry.formName, formEntry.nameEn)
    return buildRow({
      id: pokemon.id,
      key,
      canonicalFormSlug: key,
      name_ko: formEntry.formLabelKo ?? `메가${formEntry.nameKo}`,
      name_en: formEntry.formLabelEn ?? `Mega ${formEntry.nameEn.charAt(0).toUpperCase() + formEntry.nameEn.slice(1)}`,
      name_ja: japaneseMegaName(baseJa, formEntry.formName),
      types: formEntry.types?.length ? formEntry.types : pokemon.types.map((entry) => entry.type.name),
      abilities,
      abilities_ko,
      stats: formEntry.stats
        ? stats
        : {
            hp: stats.hp,
            attack: stats.attack,
            defense: stats.defense,
            spAttack: stats['special-attack'],
            spDefense: stats['special-defense'],
            speed: stats.speed,
          },
      sprite: pokemon.sprites.other['official-artwork'].front_default,
      sprite_status: 'pokeapi-official-artwork',
    })
  }

  const missingBaseIds = [...currentListBaseIds].filter((id) => !currentIds.has(id)).sort((a, b) => a - b)
  const addedRows = []

  for (const id of missingBaseIds) {
    const baseEntry = baseEntryById.get(id)
    if (!baseEntry) throw new Error(`Missing base entry for dex ${id}`)
    const row = await buildBaseRow(baseEntry)
    if (!currentKeys.has(row.key)) {
      currentKeys.add(row.key)
      addedRows.push({ row, source: 'current-list-base' })
    }
  }

  for (const formEntry of megaCatalogEntries) {
    const megaKey = keyFromMegaFormName(formEntry.formName, formEntry.nameEn)
    if (!megaKey || disallowedLegendaryMegaKeys.has(megaKey) || currentKeys.has(megaKey)) continue
    const row = await buildMegaCatalogRow(formEntry)
    currentKeys.add(row.key)
    addedRows.push({ row, source: 'allPokemon-mega-catalog' })
  }

  for (const config of MANUAL_FORMS) {
    if (currentKeys.has(config.key)) continue
    const row = await buildManualFormRow(config)
    currentKeys.add(config.key)
    addedRows.push({ row, source: config.source })
  }

  const nextRows = [...currentRows, ...addedRows.map((entry) => entry.row)]
  verifiedData.rows = nextRows
  verifiedData.regulation = CURRENT_REGULATION
  verifiedData.verified_sprite_count = nextRows.filter((row) => row.sprite).length
  verifiedData.total = nextRows.length
  await fs.writeFile(verifiedDataPath, JSON.stringify(verifiedData, null, 2) + '\n')

  const report = {
    generatedAt: new Date().toISOString(),
    currentListBaseIds: [...currentListBaseIds].sort((a, b) => a - b),
    missingBaseIds,
    addedCount: addedRows.length,
    added: addedRows.map(({ row, source }) => ({
      source,
      id: row.id,
      key: row.key,
      canonicalFormSlug: row.canonicalFormSlug,
      name_ko: row.name_ko,
      name_en: row.name_en,
      abilities: row.abilities,
    })),
    manualFormsConfigured: MANUAL_FORMS.map((form) => form.key),
    manualFormsPresent: MANUAL_FORMS.filter((form) => nextRows.some((row) => row.key === form.key)).map((form) => form.key),
    totalRows: nextRows.length,
  }
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n')

  console.log(`Added ${addedRows.length} rows -> ${path.relative(root, verifiedDataPath)}`)
  console.log(`Wrote report -> ${path.relative(root, reportPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
