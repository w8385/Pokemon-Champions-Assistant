import type { CreatorSample } from './creatorSampleLibrary'

// Static, source-backed M-6 singles party transcriptions. Unknowns stay absent;
// a raw Japanese label is not treated as a validated import alias.
export const m6TopTenSamples: CreatorSample[] = [
  {
    "id": "blog-m6-1-n68915c0c22e4-slot1-mega-charizard-y",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-charizard-y",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — リザードン",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "bold",
      "item": "리자몽나이트Y",
      "ability": "가뭄",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 1,
        "spDefense": 1,
        "speed": 0
      },
      "moves": [
        "웨더볼",
        "암석봉인",
        "솔라빔",
        "용의파동"
      ]
    },
    "partialBuild": {
      "item": "리자몽나이트Y",
      "moves": [
        "웨더볼",
        "암석봉인",
        "솔라빔",
        "용의파동"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 1,
        "spDefense": 1,
        "speed": 0
      },
      "actualStats": {
        "hp": 185,
        "attack": 111,
        "defense": 143,
        "spAttack": 180,
        "spDefense": 136,
        "speed": 120
      },
      "actualStatsForm": "mega-charizard-y",
      "ability": "가뭄",
      "nature": "bold"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 1번, 원문 リザードン 185(32)-111(0)-143(32)-180(1)-136(1)-120(0). 원문 도구 リザードナイトY; 원문 네 기술 ウェザーボール / がんせきふうじ / ソーラービーム / りゅうのはどう. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 1",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 1; 원문 リザードナイトY; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 1 moves 1–4; 원문 네 기술 ウェザーボール / がんせきふうじ / ソーラービーム / りゅうのはどう; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791409312-oQET7H4DbNgrICGYqVAe9W5u.png",
          "location": "party stats screenshot slot 1, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791409312-oQET7H4DbNgrICGYqVAe9W5u.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791409312-oQET7H4DbNgrICGYqVAe9W5u.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791409312-oQET7H4DbNgrICGYqVAe9W5u.png",
          "location": "slot 1 ability field; 원문 ひでり; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791409312-oQET7H4DbNgrICGYqVAe9W5u.png",
          "location": "slot 1 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 1: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-1-n68915c0c22e4-slot2-hippowdon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hippowdon",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — カバルドン",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "impish",
      "item": "たべのこし",
      "ability": "모래날림",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 0,
        "spDefense": 2,
        "speed": 0
      },
      "moves": [
        "방어",
        "하품",
        "지진",
        "태만함"
      ]
    },
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "방어",
        "하품",
        "지진",
        "태만함"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 0,
        "spDefense": 2,
        "speed": 0
      },
      "actualStats": {
        "hp": 215,
        "attack": 132,
        "defense": 187,
        "spAttack": 79,
        "spDefense": 94,
        "speed": 67
      },
      "actualStatsForm": "hippowdon",
      "ability": "모래날림",
      "nature": "impish"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 2번, 원문 カバルドン 215(32)-132(0)-187(32)-79(0)-94(2)-67(0). 원문 도구 たべのこし; 원문 네 기술 まもる / あくび / じしん / なまける. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 6개 명시 노력 포인트, 성격/특성 및 도구/네 기술을 앱 정규 메타데이터와 대조해 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 2",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 2; 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 2 moves 1–4; 원문 네 기술 まもる / あくび / じしん / なまける; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 2, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791408876-mADxTRSZ4IyWEaYNh29i50cv.png",
          "location": "slot 2 ability field; 원문 すなおこし; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791408876-mADxTRSZ4IyWEaYNh29i50cv.png",
          "location": "slot 2 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 2: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-1-n68915c0c22e4-slot3-basculegion",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "basculegion",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — イダイトウ オスのすがた",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "adamant",
      "item": "のろいのおふだ",
      "ability": "적응력",
      "evs": {
        "hp": 8,
        "attack": 32,
        "defense": 18,
        "spAttack": 0,
        "spDefense": 5,
        "speed": 3
      },
      "moves": [
        "성묘",
        "아쿠아제트",
        "고속이동",
        "대타출동"
      ]
    },
    "partialBuild": {
      "item": "のろいのおふだ",
      "moves": [
        "성묘",
        "아쿠아제트",
        "고속이동",
        "대타출동"
      ],
      "evsKnown": {
        "hp": 8,
        "attack": 32,
        "defense": 18,
        "spAttack": 0,
        "spDefense": 5,
        "speed": 3
      },
      "actualStats": {
        "hp": 203,
        "attack": 180,
        "defense": 103,
        "spAttack": 90,
        "spDefense": 100,
        "speed": 101
      },
      "actualStatsForm": "basculegion",
      "ability": "적응력",
      "nature": "adamant"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 3번, 원문 イダイトウ オスのすがた 203(8)-180(32)-103(18)-90(0)-100(5)-101(3). 원문 도구 のろいのおふだ; 원문 네 기술 おはかまいり / アクアジェット / こうそくいどう / みがわり. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 3",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 3; 원문 のろいのおふだ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 3 moves 1–4; 원문 네 기술 おはかまいり / アクアジェット / こうそくいどう / みがわり; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 3, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791362207-BfgIVlDxGNCHMbzPo5Xq9iZs.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791398869-6Qu5xalTqOFmnD0rYjibB4Co.png",
          "location": "slot 3 ability field; 원문 てきおうりょく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791398869-6Qu5xalTqOFmnD0rYjibB4Co.png",
          "location": "slot 3 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 3: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-1-n68915c0c22e4-slot4-mega-kangaskhan",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-kangaskhan",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — ガルーラ",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "adamant",
      "item": "캥카나이트",
      "ability": "부자유친",
      "evs": {
        "hp": 27,
        "attack": 32,
        "defense": 1,
        "spAttack": 0,
        "spDefense": 6,
        "speed": 0
      },
      "moves": [
        "누르기",
        "지진",
        "냉동펀치",
        "배대뒤치기"
      ]
    },
    "partialBuild": {
      "item": "캥카나이트",
      "moves": [
        "누르기",
        "지진",
        "냉동펀치",
        "배대뒤치기"
      ],
      "evsKnown": {
        "hp": 27,
        "attack": 32,
        "defense": 1,
        "spAttack": 0,
        "spDefense": 6,
        "speed": 0
      },
      "actualStats": {
        "hp": 207,
        "attack": 194,
        "defense": 121,
        "spAttack": 72,
        "spDefense": 126,
        "speed": 120
      },
      "actualStatsForm": "mega-kangaskhan",
      "ability": "부자유친",
      "nature": "adamant"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 4번, 원문 ガルーラ 207(27)-194(32)-121(1)-72(0)-126(6)-120(0). 원문 도구 ガルーラナイト; 원문 네 기술 のしかかり / じしん / れいとうパンチ / ともえなげ. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 4",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 4; 원문 ガルーラナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 4 moves 1–4; 원문 네 기술 のしかかり / じしん / れいとうパンチ / ともえなげ; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791409446-DFiwszlfgRLJrEnXv8O2cTey.png",
          "location": "party stats screenshot slot 4, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791409446-DFiwszlfgRLJrEnXv8O2cTey.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791409446-DFiwszlfgRLJrEnXv8O2cTey.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791409446-DFiwszlfgRLJrEnXv8O2cTey.png",
          "location": "slot 4 ability field; 원문 おやこあい; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791409446-DFiwszlfgRLJrEnXv8O2cTey.png",
          "location": "slot 4 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 4: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-1-n68915c0c22e4-slot5-hatterene",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hatterene",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — ブリムオン",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "bold",
      "item": "オボンのみ",
      "ability": "매직미러",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 0,
        "spDefense": 2,
        "speed": 0
      },
      "moves": [
        "트릭룸",
        "드레인키스",
        "사이코노이즈",
        "치유소원"
      ]
    },
    "partialBuild": {
      "item": "オボンのみ",
      "moves": [
        "트릭룸",
        "드레인키스",
        "사이코노이즈",
        "치유소원"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 32,
        "spAttack": 0,
        "spDefense": 2,
        "speed": 0
      },
      "actualStats": {
        "hp": 164,
        "attack": 99,
        "defense": 161,
        "spAttack": 156,
        "spDefense": 125,
        "speed": 49
      },
      "actualStatsForm": "hatterene",
      "ability": "매직미러",
      "nature": "bold"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 5번, 원문 ブリムオン 164(32)-99(0)-161(32)-156(0)-125(2)-49(0). 원문 도구 オボンのみ; 원문 네 기술 トリックルーム / ドレインキッス / サイコノイズ / いやしのねがい. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 5",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 5; 원문 オボンのみ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 5 moves 1–4; 원문 네 기술 トリックルーム / ドレインキッス / サイコノイズ / いやしのねがい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791397377-FzGPwXMOTn8Jfo5jt7iWUavZ.png",
          "location": "party stats screenshot slot 5, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791397377-FzGPwXMOTn8Jfo5jt7iWUavZ.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791397377-FzGPwXMOTn8Jfo5jt7iWUavZ.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791397377-FzGPwXMOTn8Jfo5jt7iWUavZ.png",
          "location": "slot 5 ability field; 원문 マジックミラー; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791397377-FzGPwXMOTn8Jfo5jt7iWUavZ.png",
          "location": "slot 5 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 5: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-1-n68915c0c22e4-slot6-hydreigon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hydreigon",
    "title": "시즌 M-6 싱글 · 【M-6 最終1位】リザYブリムオン — サザンドラ",
    "creator": "ゆかい",
    "rank": "작성자 공개 최종1위",
    "status": "verified",
    "build": {
      "nature": "modest",
      "item": "こだわりスカーフ",
      "ability": "부유",
      "evs": {
        "hp": 2,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 0,
        "speed": 32
      },
      "moves": [
        "악의파동",
        "용성군",
        "화염방사",
        "기합구슬"
      ]
    },
    "partialBuild": {
      "item": "こだわりスカーフ",
      "moves": [
        "악의파동",
        "용성군",
        "화염방사",
        "기합구슬"
      ],
      "evsKnown": {
        "hp": 2,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 0,
        "speed": 32
      },
      "actualStats": {
        "hp": 169,
        "attack": 112,
        "defense": 110,
        "spAttack": 194,
        "spDefense": 110,
        "speed": 150
      },
      "actualStatsForm": "hydreigon",
      "ability": "부유",
      "nature": "modest"
    },
    "provenance": {
      "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "canonicalUrl": "https://note.com/abclil/n/n68915c0c22e4",
      "sourceId": "blog-m6-1-n68915c0c22e4",
      "publishedAt": "2026-10-08 09:04 JST",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終1位】リザYブリムオン / 작성자 ゆかい, TN まおう; 파티 화면 6번, 원문 サザンドラ 169(2)-112(0)-110(0)-194(32)-110(0)-150(32). 원문 도구 こだわりスカーフ; 원문 네 기술 あくのはどう / りゅうせいぐん / かえんほうしゃ / きあいだま. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 6개 명시 노력 포인트, 성격/특성 및 도구/네 기술을 앱 정규 메타데이터와 대조해 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "party screenshot slot 6",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 6; 원문 こだわりスカーフ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://assets.st-note.com/img/1791362142-Ajs2gcZl17WrXQFoREuxGfS8.png",
          "location": "party screenshot slot 6 moves 1–4; 원문 네 기술 あくのはどう / りゅうせいぐん / かえんほうしゃ / きあいだま; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://assets.st-note.com/img/1791409681-5pSnO7ZQ6sDzt4l0fATHEILq.png",
          "location": "party stats screenshot slot 6, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://assets.st-note.com/img/1791409681-5pSnO7ZQ6sDzt4l0fATHEILq.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://assets.st-note.com/img/1791409681-5pSnO7ZQ6sDzt4l0fATHEILq.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://assets.st-note.com/img/1791409681-5pSnO7ZQ6sDzt4l0fATHEILq.png",
          "location": "slot 6 ability field; 원문 ふゆう; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://assets.st-note.com/img/1791409681-5pSnO7ZQ6sDzt4l0fATHEILq.png",
          "location": "slot 6 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 작성자/제목: 【M-6 最終1位】リザYブリムオン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://assets.st-note.com/img/1791362112-HdQDAZJB42vT8XE3pRSswgLN.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://note.com/abclil/n/n68915c0c22e4",
          "location": "원문 슬롯 6: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot1-hippowdon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hippowdon",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — カバルドン",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "impish",
      "item": "たべのこし",
      "ability": "모래날림",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 12,
        "spAttack": 0,
        "spDefense": 22,
        "speed": 0
      },
      "moves": [
        "지진",
        "얼음엄니",
        "하품",
        "태만함"
      ]
    },
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "지진",
        "얼음엄니",
        "하품",
        "태만함"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 12,
        "spAttack": 0,
        "spDefense": 22,
        "speed": 0
      },
      "actualStats": {
        "hp": 215,
        "attack": 132,
        "defense": 165,
        "spAttack": 79,
        "spDefense": 114,
        "speed": 67
      },
      "actualStatsForm": "hippowdon",
      "ability": "모래날림",
      "nature": "impish"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 1번, 원문 カバルドン 215(32)-132(0)-165(12)-79(0)-114(22)-67(0). 원문 도구 たべのこし; 원문 네 기술 じしん / こおりのキバ / あくび / なまける. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 6개 명시 노력 포인트, 성격/특성 및 도구/네 기술을 앱 정규 메타데이터와 대조해 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 1",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 1; 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 1 moves 1–4; 원문 네 기술 じしん / こおりのキバ / あくび / なまける; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 1, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000529.png",
          "location": "slot 1 ability field; 원문 すなおこし; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000529.png",
          "location": "slot 1 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 1: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot2-mega-glimmora",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-glimmora",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — キラフロル",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "timid",
      "item": "킬라플로르나이트",
      "ability": "적응력",
      "evs": {
        "hp": 1,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 1,
        "speed": 32
      },
      "moves": [
        "파워젬",
        "오물웨이브",
        "에너지볼",
        "대지의힘"
      ]
    },
    "partialBuild": {
      "item": "킬라플로르나이트",
      "moves": [
        "파워젬",
        "오물웨이브",
        "에너지볼",
        "대지의힘"
      ],
      "evsKnown": {
        "hp": 1,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 1,
        "speed": 32
      },
      "actualStats": {
        "hp": 159,
        "attack": 99,
        "defense": 125,
        "spAttack": 202,
        "spDefense": 117,
        "speed": 168
      },
      "actualStatsForm": "mega-glimmora",
      "ability": "적응력",
      "nature": "timid"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 2번, 원문 キラフロル 159(1)-99(0)-125(0)-202(32)-117(1)-168(32). 원문 도구 キラフロルナイト; 원문 네 기술 パワージェム / ヘドロウェーブ / エナジーボール / だいちのちから. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 2",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 2; 원문 キラフロルナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 2 moves 1–4; 원문 네 기술 パワージェム / ヘドロウェーブ / エナジーボール / だいちのちから; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008103738.png",
          "location": "party stats screenshot slot 2, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008103738.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008103738.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008103738.png",
          "location": "slot 2 ability field; 원문 てきおうりょく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008103738.png",
          "location": "slot 2 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 2: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot3-corviknight",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "corviknight",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — アーマーガア",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "impish",
      "item": "ゴツゴツメット",
      "ability": "미러아머",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 5,
        "spAttack": 0,
        "spDefense": 29,
        "speed": 0
      },
      "moves": [
        "아이언헤드",
        "안개제거",
        "유턴",
        "날개쉬기"
      ]
    },
    "partialBuild": {
      "item": "ゴツゴツメット",
      "moves": [
        "아이언헤드",
        "안개제거",
        "유턴",
        "날개쉬기"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 5,
        "spAttack": 0,
        "spDefense": 29,
        "speed": 0
      },
      "actualStats": {
        "hp": 205,
        "attack": 107,
        "defense": 143,
        "spAttack": 65,
        "spDefense": 134,
        "speed": 87
      },
      "actualStatsForm": "corviknight",
      "ability": "미러아머",
      "nature": "impish"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 3번, 원문 アーマーガア 205(32)-107(0)-143(5)-65(0)-134(29)-87(0). 원문 도구 ゴツゴツメット; 원문 네 기술 アイアンヘッド / きりばらい / とんぼがえり / はねやすめ. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 6개 명시 노력 포인트, 성격/특성 및 도구/네 기술을 앱 정규 메타데이터와 대조해 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 3",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 3; 원문 ゴツゴツメット; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 3 moves 1–4; 원문 네 기술 アイアンヘッド / きりばらい / とんぼがえり / はねやすめ; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 3, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008100641.png",
          "location": "slot 3 ability field; 원문 ミラーアーマー; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008100641.png",
          "location": "slot 3 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 3: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot4-primarina",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "primarina",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — アシレーヌ",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "modest",
      "item": "カゴのみ",
      "ability": "급류",
      "evs": {
        "hp": 28,
        "attack": 0,
        "defense": 24,
        "spAttack": 0,
        "spDefense": 0,
        "speed": 14
      },
      "moves": [
        "물거품아리아",
        "문포스",
        "명상",
        "잠자기"
      ]
    },
    "partialBuild": {
      "item": "カゴのみ",
      "moves": [
        "물거품아리아",
        "문포스",
        "명상",
        "잠자기"
      ],
      "evsKnown": {
        "hp": 28,
        "attack": 0,
        "defense": 24,
        "spAttack": 0,
        "spDefense": 0,
        "speed": 14
      },
      "actualStats": {
        "hp": 183,
        "attack": 84,
        "defense": 118,
        "spAttack": 160,
        "spDefense": 136,
        "speed": 94
      },
      "actualStatsForm": "primarina",
      "ability": "급류",
      "nature": "modest"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 4번, 원문 アシレーヌ 183(28)-84(0)-118(24)-160(0)-136(0)-94(14). 원문 도구 カゴのみ; 원문 네 기술 うたかたのアリア / ムーンフォース / めいそう / ねむる. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 6개 명시 노력 포인트, 성격/특성 및 도구/네 기술을 앱 정규 메타데이터와 대조해 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 4",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 4; 원문 カゴのみ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 4 moves 1–4; 원문 네 기술 うたかたのアリア / ムーンフォース / めいそう / ねむる; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 4, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008104547.png",
          "location": "slot 4 ability field; 원문 げきりゅう; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008104547.png",
          "location": "slot 4 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 4: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot5-indeedee-male",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "indeedee-male",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — イエッサン オスのすがた",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "timid",
      "item": "きあいのタスキ",
      "ability": "사이코메이커",
      "evs": {
        "hp": 0,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 2,
        "speed": 32
      },
      "moves": [
        "와이드포스",
        "사이코노이즈",
        "매지컬플레임",
        "앵콜"
      ]
    },
    "partialBuild": {
      "item": "きあいのタスキ",
      "moves": [
        "와이드포스",
        "사이코노이즈",
        "매지컬플레임",
        "앵콜"
      ],
      "evsKnown": {
        "hp": 0,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 2,
        "speed": 32
      },
      "actualStats": {
        "hp": 135,
        "attack": 76,
        "defense": 75,
        "spAttack": 157,
        "spDefense": 117,
        "speed": 161
      },
      "actualStatsForm": "indeedee-male",
      "ability": "사이코메이커",
      "nature": "timid"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 5번, 원문 イエッサン オスのすがた 135(0)-76(0)-75(0)-157(32)-117(2)-161(32). 원문 도구 きあいのタスキ; 원문 네 기술 ワイドフォース / サイコノイズ / マジカルフレイム / アンコール. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 5",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 5; 원문 きあいのタスキ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 5 moves 1–4; 원문 네 기술 ワイドフォース / サイコノイズ / マジカルフレイム / アンコール; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 5, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008114951.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008093535.png",
          "location": "slot 5 ability field; 원문 サイコメイカー; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008093535.png",
          "location": "slot 5 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 5: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-3-2026-10-08-115914-slot6-mega-golisopod",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-golisopod",
    "title": "시즌 M-6 싱글 · 【M-6 シングル最終3位】カバ武者スタン — グソクムシャ",
    "creator": "かんた",
    "rank": "작성자 공개 최종3위",
    "status": "verified",
    "build": {
      "nature": "jolly",
      "item": "갑주무사나이트",
      "ability": "단단한발톱",
      "evs": {
        "hp": 9,
        "attack": 25,
        "defense": 1,
        "spAttack": 0,
        "spDefense": 1,
        "speed": 30
      },
      "moves": [
        "흡혈",
        "기습",
        "칼춤",
        "도발"
      ]
    },
    "partialBuild": {
      "item": "갑주무사나이트",
      "moves": [
        "흡혈",
        "기습",
        "칼춤",
        "도발"
      ],
      "evsKnown": {
        "hp": 9,
        "attack": 25,
        "defense": 1,
        "spAttack": 0,
        "spDefense": 1,
        "speed": 30
      },
      "actualStats": {
        "hp": 159,
        "attack": 195,
        "defense": 196,
        "spAttack": 81,
        "spDefense": 141,
        "speed": 99
      },
      "actualStatsForm": "mega-golisopod",
      "ability": "단단한발톱",
      "nature": "jolly"
    },
    "provenance": {
      "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "canonicalUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
      "sourceId": "blog-m6-3-2026-10-08-115914",
      "publishedAt": "2026-10-08T02:59:14Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 シングル最終3位】カバ武者スタン / 작성자 かんた, TN かんた; 파티 화면 6번, 원문 グソクムシャ 159(9)-195(25)-196(1)-81(0)-141(1)-99(30). 원문 도구 グソクムシャナイト; 원문 네 기술 きゅうけつ / ふいうち / つるぎのまい / ちょうはつ. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 6",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 6; 원문 グソクムシャナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008000128.png",
          "location": "party screenshot slot 6 moves 1–4; 원문 네 기술 きゅうけつ / ふいうち / つるぎのまい / ちょうはつ; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008102346.png",
          "location": "party stats screenshot slot 6, numbers following stat bars only",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008102346.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008102346.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008102346.png",
          "location": "slot 6 ability field; 원문 かたいツメ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008102346.png",
          "location": "slot 6 ability correction label",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 작성자/제목: 【M-6 シングル最終3位】カバ武者スタン",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/m/meltdowner/20261008/20261008113504.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://meltdowner.hatenablog.com/entry/2026/10/08/115914",
          "location": "원문 슬롯 6: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot1-hippowdon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hippowdon",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — カバルドン",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "verified",
    "build": {
      "nature": "impish",
      "item": "たべのこし",
      "ability": "모래날림",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 12,
        "spAttack": 0,
        "spDefense": 22,
        "speed": 0
      },
      "moves": [
        "지진",
        "하품",
        "태만함",
        "방어"
      ]
    },
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "지진",
        "하품",
        "태만함",
        "방어"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 12,
        "spAttack": 0,
        "spDefense": 22,
        "speed": 0
      },
      "actualStats": {
        "hp": 215,
        "attack": 132,
        "defense": 165,
        "spAttack": 79,
        "spDefense": 114,
        "speed": 67
      },
      "actualStatsForm": "hippowdon",
      "nature": "impish",
      "ability": "모래날림"
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 1번, 원문 カバルドン 215(32)-132-165(12)-79-114(22)-67. 원문 도구 たべのこし; 원문 네 기술 じしん / あくび / なまける / まもる. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 すなおこし 확인; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 1",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 1, item; 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 1, moves; 원문 네 기술 じしん / あくび / なまける / まもる; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 1: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 1, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 1 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 1: 특성 すなおこし → 모래날림",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 슬롯 1: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot2-mega-lucario-z",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-lucario-z",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — ルカリオ",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ルカリオナイトZ",
      "moves": [
        "파동탄",
        "철제광선",
        "악의파동",
        "진공파"
      ],
      "evsKnown": {
        "hp": 1,
        "attack": 0,
        "defense": 0,
        "spAttack": 32,
        "spDefense": 1,
        "speed": 32
      },
      "actualStats": {
        "hp": 146,
        "attack": 117,
        "defense": 90,
        "spAttack": 183,
        "spDefense": 91,
        "speed": 142
      },
      "actualStatsForm": "lucario",
      "nature": "modest",
      "preMegaAbilities": [
        "정신력"
      ]
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 2번, 원문 ルカリオ 146(1)-117-90-183(32)-91(1)-142(32). 원문 도구 ルカリオナイトZ; 원문 네 기술 はどうだん / てっていこうせん / あくのはどう / しんくうは. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 せいしんりょく 확인(메가진화 전만; 메가 후 미확인); 메가진화 후 특성 미확인으로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 2",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 2, item; 원문 ルカリオナイトZ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 2, moves; 원문 네 기술 はどうだん / てっていこうせん / あくのはどう / しんくうは; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 2: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 2, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 2 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 2: 메가진화 전 특성 せいしんりょく → 정신력; 메가 특성 미출력",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot3-basculegion",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "basculegion",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — イダイトウ",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "verified",
    "build": {
      "nature": "adamant",
      "item": "しんぴのしずく",
      "ability": "적응력",
      "evs": {
        "hp": 12,
        "attack": 31,
        "defense": 22,
        "spAttack": 0,
        "spDefense": 1,
        "speed": 0
      },
      "moves": [
        "웨이브태클",
        "퀵턴",
        "고스트다이브",
        "아쿠아제트"
      ]
    },
    "partialBuild": {
      "item": "しんぴのしずく",
      "moves": [
        "웨이브태클",
        "퀵턴",
        "고스트다이브",
        "아쿠아제트"
      ],
      "evsKnown": {
        "hp": 12,
        "attack": 31,
        "defense": 22,
        "spAttack": 0,
        "spDefense": 1,
        "speed": 0
      },
      "actualStats": {
        "hp": 207,
        "attack": 179,
        "defense": 107,
        "spAttack": 90,
        "spDefense": 96,
        "speed": 98
      },
      "actualStatsForm": "basculegion",
      "nature": "adamant",
      "ability": "적응력"
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 3번, 원문 イダイトウ 207(12)-179(31)-107(22)-90-96(1)-98. 원문 도구 しんぴのしずく; 원문 네 기술 ウェーブタックル / クイックターン / ゴーストダイブ / アクアジェット. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시. 원문 방어 실능 107 보존; 계산/역산값으로 수정 안 함.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 てきおうりょく 확인; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 3",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 3, item; 원문 しんぴのしずく; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 3, moves; 원문 네 기술 ウェーブタックル / クイックターン / ゴーストダイブ / アクアジェット; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 3: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 3, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 3 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 3: 특성 てきおうりょく → 적응력",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 슬롯 3: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot4-meowscarada",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "meowscarada",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — マスカーニャ",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "verified",
    "build": {
      "nature": "adamant",
      "item": "いのちのたま",
      "ability": "변환자재",
      "evs": {
        "hp": 1,
        "attack": 32,
        "defense": 3,
        "spAttack": 0,
        "spDefense": 0,
        "speed": 30
      },
      "moves": [
        "트릭플라워",
        "트리플악셀",
        "번개펀치",
        "안다리걸기"
      ]
    },
    "partialBuild": {
      "item": "いのちのたま",
      "moves": [
        "트릭플라워",
        "트리플악셀",
        "번개펀치",
        "안다리걸기"
      ],
      "evsKnown": {
        "hp": 1,
        "attack": 32,
        "defense": 3,
        "spAttack": 0,
        "spDefense": 0,
        "speed": 30
      },
      "actualStats": {
        "hp": 152,
        "attack": 178,
        "defense": 93,
        "spAttack": 90,
        "spDefense": 90,
        "speed": 173
      },
      "actualStatsForm": "meowscarada",
      "nature": "adamant",
      "ability": "변환자재"
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 4번, 원문 マスカーニャ 152(1)-178(32)-93(3)-90-90-173(30). 원문 도구 いのちのたま; 원문 네 기술 トリックフラワー / トリプルアクセル / かみなりパンチ / けたぐり. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 へんげんじざい 확인; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 4",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 4, item; 원문 いのちのたま; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 4, moves; 원문 네 기술 トリックフラワー / トリプルアクセル / かみなりパンチ / けたぐり; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 4: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 4, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 4 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 4: 특성 へんげんじざい → 변환자재",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 슬롯 4: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot5-archaludon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "archaludon",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — ブリジュラス",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "verified",
    "build": {
      "nature": "calm",
      "item": "オボンのみ",
      "ability": "지구력",
      "evs": {
        "hp": 32,
        "attack": 0,
        "defense": 4,
        "spAttack": 5,
        "spDefense": 25,
        "speed": 0
      },
      "moves": [
        "용성군",
        "10만볼트",
        "드래곤테일",
        "스텔스록"
      ]
    },
    "partialBuild": {
      "item": "オボンのみ",
      "moves": [
        "용성군",
        "10만볼트",
        "드래곤테일",
        "스텔스록"
      ],
      "evsKnown": {
        "hp": 32,
        "attack": 0,
        "defense": 4,
        "spAttack": 5,
        "spDefense": 25,
        "speed": 0
      },
      "actualStats": {
        "hp": 197,
        "attack": 112,
        "defense": 154,
        "spAttack": 150,
        "spDefense": 121,
        "speed": 105
      },
      "actualStatsForm": "archaludon",
      "nature": "calm",
      "ability": "지구력"
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 5번, 원문 ブリジュラス 197(32)-112-154(4)-150(5)-121(25)-105. 원문 도구 オボンのみ; 원문 네 기술 りゅうせいぐん / 10まんボルト / ドラゴンテール / ステルスロック. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 じきゅうりょく 확인; 명시 필드·정규화 및 로스터 일치 검증으로 완성형 가져오기 허용.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 5",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 5, item; 원문 オボンのみ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 5, moves; 원문 네 기술 りゅうせいぐん / 10まんボルト / ドラゴンテール / ステルスロック; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 5: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 5, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 5 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 5: 특성 じきゅうりょく → 지구력",
          "checkedAt": "2026-10-18"
        },
        "build": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 슬롯 5: 도구/특성/성격(화살표 보정)/명시 여섯 투자값/네 기술; 원문 철자 provenance.evidence 및 각 필드 location에 보존; 정규화 dexDescriptions.json, Champions 도구, PokeAPI 다국어 CSV",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-4-2026-10-09-232857-slot6-mega-charizard-y",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-charizard-y",
    "title": "시즌 M-6 싱글 · M-6 最終4位 カバルカロジック — リザードン",
    "creator": "Cresselia",
    "rank": "작성자 공개 최종4위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "리자몽나이트Y",
      "moves": [
        "화염방사",
        "솔라빔",
        "오버히트",
        "울부짖기"
      ],
      "evsKnown": {
        "hp": 22,
        "attack": 0,
        "defense": 19,
        "spAttack": 21,
        "spDefense": 0,
        "speed": 4
      },
      "actualStats": {
        "hp": 175,
        "attack": 93,
        "defense": 117,
        "spAttack": 165,
        "spDefense": 105,
        "speed": 124
      },
      "actualStatsForm": "charizard",
      "nature": "modest",
      "preMegaAbilities": [
        "맹화"
      ]
    },
    "provenance": {
      "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "canonicalUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
      "sourceId": "blog-m6-4-2026-10-09-232857",
      "publishedAt": "2026-10-09T14:28:57Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終4位 カバルカロジック / 작성자 Cresselia, TN Sleep; 파티 화면 6번, 원문 リザードン 175(22)-93-117(19)-165(21)-105-124(4). 원문 도구 リザードナイトY; 원문 네 기술 かえんほうしゃ / ソーラービーム / オーバーヒート / ほえる. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 성격 ↑↓ 원본 화살표에서 추론, 이름은 미표시.  원문 이미지3 여섯 노력 포인트(0 포함)와 성격 보정 화살표 확인; 이미지2 특성 もうか 확인(메가진화 전만; 메가 후 미확인); 메가진화 후 특성 미확인으로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "party screenshot slot 6",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 6, item; 원문 リザードナイトY; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "party ability screenshot slot 6, moves; 원문 네 기술 かえんほうしゃ / ソーラービーム / オーバーヒート / ほえる; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "원문 이미지3 슬롯 6: HP/공격/방어/특공/특방/스피드 여섯 투자값(0 포함)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "party stats screenshot slot 6, HP/Atk/Def/SpA/SpD/Spe",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211047.png",
          "location": "slot 6 stat arrows; nature name not printed; ↑↓ pair, nature name not printed",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://cresseliapoke.hatenablog.com/entry/2026/10/09/232857",
          "location": "원문 작성자/제목: M-6 最終4位 カバルカロジック",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008205947.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Cresselia/20261008/20261008211029.png",
          "location": "원문 이미지2 슬롯 6: 메가진화 전 특성 もうか → 맹화; 메가 특성 미출력",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot1-meowscarada",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "meowscarada",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — マスカーニャ",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "きあいのタスキ",
      "moves": [
        "트릭플라워",
        "탁쳐서떨구기",
        "기습",
        "압정뿌리기"
      ],
      "evsKnown": {
        "attack": 32,
        "spDefense": 2,
        "speed": 32
      },
      "actualStats": {
        "hp": 151,
        "attack": 178,
        "defense": 90,
        "spAttack": 90,
        "spDefense": 92,
        "speed": 175
      },
      "actualStatsForm": "meowscarada"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 1번, 원문 マスカーニャ 151-178(32)-90-90-92(2)-175(32). 원문 도구 きあいのタスキ; 원문 네 기술 トリックフラワー / はたきおとす / ふいうち / まきびし. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line); 원문 きあいのタスキ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line); 원문 네 기술 トリックフラワー / はたきおとす / ふいうち / まきびし; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / マスカーニャ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot2-mega-lucario-z",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-lucario-z",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — メガルカリオZ",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ルカリオナイトZ",
      "moves": [
        "파동탄",
        "진공파",
        "徹底抗戦",
        "悪の波動"
      ],
      "evsKnown": {
        "hp": 1,
        "spAttack": 32,
        "spDefense": 1,
        "speed": 32
      },
      "actualStats": {
        "hp": 146,
        "attack": 108,
        "defense": 90,
        "spAttack": 237,
        "spDefense": 91,
        "speed": 203
      },
      "actualStatsForm": "mega-lucario-z"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 2번, 원문 メガルカリオZ 146(1)-108-90-237(32)-91(1)-203(32). 원문 도구 ルカリオナイトZ; 원문 네 기술 はどうだん / しんくうは / 徹底抗戦 / 悪の波動. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line); 원문 ルカリオナイトZ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line); 원문 네 기술 はどうだん / しんくうは / 徹底抗戦 / 悪の波動; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガルカリオZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot3-basculegion",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "basculegion",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — イダイトウ",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "オボンのみ",
      "moves": [
        "웨이브태클",
        "퀵턴",
        "아쿠아제트",
        "성묘"
      ],
      "evsKnown": {
        "hp": 9,
        "attack": 28,
        "defense": 20,
        "speed": 9
      },
      "actualStats": {
        "hp": 204,
        "attack": 176,
        "defense": 105,
        "spAttack": 90,
        "spDefense": 95,
        "speed": 107
      },
      "actualStatsForm": "basculegion"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 3번, 원문 イダイトウ 204(9)-176(28)-105(20)-90-95-107(9). 원문 도구 オボン; 원문 네 기술 ウェーブタックル / クイックターン / アクアジェット / おはかまいり. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님. Original article omits sex; local basculegion key denotes male, inferred from 176 Attack with 28 effort and secondarily indexed as male, not explicitly transcribed from this article. 표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); 원문 オボン; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); 원문 네 기술 ウェーブタックル / クイックターン / アクアジェット / おはかまいり; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot4-hippowdon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hippowdon",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — カバルドン",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "지진",
        "하품",
        "날려버리기",
        "스텔스록"
      ],
      "evsKnown": {
        "hp": 32,
        "defense": 12,
        "spDefense": 22
      },
      "actualStats": {
        "hp": 215,
        "attack": 132,
        "defense": 165,
        "spAttack": 79,
        "spDefense": 114,
        "speed": 67
      },
      "actualStatsForm": "hippowdon"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 4번, 원문 カバルドン 215(32)-132-165(12)-79-114(22)-67. 원문 도구 たべのこし; 원문 네 기술 じしん / あくび / ふきとばし / ステルスロック. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line); 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line); 원문 네 기술 じしん / あくび / ふきとばし / ステルスロック; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot5-mega-metagross",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-metagross",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — メガメタグロス",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "メタグロスナイト",
      "moves": [
        "번개펀치",
        "지진",
        "냉동펀치",
        "불릿펀치"
      ],
      "evsKnown": {
        "hp": 12,
        "attack": 25,
        "defense": 3,
        "speed": 26
      },
      "actualStats": {
        "hp": 167,
        "attack": 209,
        "defense": 173,
        "spAttack": 112,
        "spDefense": 130,
        "speed": 156
      },
      "actualStatsForm": "mega-metagross"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 5번, 원문 メガメタグロス 167(12)-209(25)-173(3)-112-130-156(26). 원문 도구 メタグロスナイト; 원문 네 기술 かみなりパンチ / じしん / れいとうパンチ / バレットパンチ. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line); 원문 メタグロスナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line); 원문 네 기술 かみなりパンチ / じしん / れいとうパンチ / バレットパンチ; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / メガメタグロス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-5-n6d45e911cbd1-slot6-rotom-heat",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "rotom-heat",
    "title": "시즌 M-6 싱글 · M-6 最終5位 カバルカマスカイダイ — ヒートロトム",
    "creator": "ろくろ",
    "rank": "작성자 제목 주장 최종5위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ゴツゴツメット",
      "moves": [
        "볼트체인지",
        "오버히트",
        "도깨비불",
        "아픔나누기"
      ],
      "evsKnown": {
        "hp": 32,
        "defense": 19,
        "spDefense": 15
      },
      "actualStats": {
        "hp": 157,
        "attack": 76,
        "defense": 146,
        "spAttack": 125,
        "spDefense": 156,
        "speed": 106
      },
      "actualStatsForm": "rotom-heat"
    },
    "provenance": {
      "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "canonicalUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
      "sourceId": "blog-m6-5-n6d45e911cbd1",
      "publishedAt": "2026-10-09T14:06:00+09:00",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終5位 カバルカマスカイダイ / 작성자 ろくろ, TN ろくろ; 파티 화면 6번, 원문 ヒートロトム 157(32)-76-146(19)-125-156(15)-106. 원문 도구 ゴツゴツメット; 원문 네 기술 ボルトチェンジ / オーバーヒート / おにび / いたみわけ. 원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님. 히트로토무는 별도 rotom-heat 정규 폼으로 확인됨.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line); 원문 ゴツゴツメット; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line); 원문 네 기술 ボルトチェンジ / オーバーヒート / おにび / いたみわけ; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "article section: 個体紹介 / ヒートロトム (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 작성자/제목: M-6 最終5位 カバルカマスカイダイ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 M-6 싱글 문맥",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://note.com/rokuromu/n/n6d45e911cbd1",
          "location": "원문 제목의 작성자 최종5위 주장; 결과 화면 미확보, 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot1-mega-dragonite",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-dragonite",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — カイリュー",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "カイリュナイト",
      "moves": [
        "竜の波動",
        "10万ボルト",
        "神速",
        "火炎放射"
      ],
      "evsKnown": {
        "hp": 1,
        "defense": 1,
        "spAttack": 32,
        "speed": 32
      },
      "actualStats": {
        "hp": 167,
        "attack": 129,
        "defense": 136,
        "spAttack": 197,
        "spDefense": 145,
        "speed": 167
      },
      "actualStatsForm": "mega-dragonite",
      "nature": "timid",
      "preMegaAbilities": [
        "멀티스케일"
      ]
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 1번, 원문 カイリュー 167(1)-129-136(1)-197(32)-145-167(+32). 원문 도구 カイリュナイト; 원문 네 기술 竜の波動 / 10万ボルト / 神速 / 火炎放射. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 1번, 화면 슬롯 1번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line); 원문 カイリュナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line); 원문 네 기술 竜の波動 / 10万ボルト / 神速 / 火炎放射; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / カイリュー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "pre-Mega ability shown in on-screen party slot 1",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot2-mega-lucario",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-lucario",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — ルカリオX",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ルカリオナイト",
      "moves": [
        "인파이트",
        "불릿펀치",
        "剣の舞",
        "地震"
      ],
      "evsKnown": {
        "hp": 10,
        "attack": 31,
        "defense": 1,
        "speed": 24
      },
      "actualStats": {
        "hp": 155,
        "attack": 215,
        "defense": 109,
        "spDefense": 90,
        "speed": 156
      },
      "actualStatsForm": "mega-lucario",
      "nature": "adamant",
      "preMegaAbilities": [
        "정의의마음"
      ]
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 2번, 원문 ルカリオX 155(10)-215(+31)-109(1)-×-90-156(24). 원문 도구 ルカリオナイト; 원문 네 기술 インファイト / バレットパンチ / 剣の舞 / 地震. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 원문 루카리오X 표기: 일반 메가루카리오, Z 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 4번, 화면 슬롯 2번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line); 원문 ルカリオナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line); 원문 네 기술 インファイト / バレットパンチ / 剣の舞 / 地震; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ルカリオX (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "pre-Mega ability shown in on-screen party slot 2",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot3-primarina",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "primarina",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — アシレーヌ",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ふうせん",
      "moves": [
        "문포스",
        "泡沫のアリア",
        "身代わり",
        "瞑想"
      ],
      "evsKnown": {
        "hp": 32,
        "defense": 3,
        "spAttack": 24,
        "spDefense": 1,
        "speed": 6
      },
      "actualStats": {
        "hp": 187,
        "defense": 97,
        "spAttack": 187,
        "spDefense": 137,
        "speed": 86
      },
      "actualStatsForm": "primarina",
      "ability": "급류"
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 3번, 원문 アシレーヌ 187(32)-×-97(3)-187(+24)-137(1)-86(6). 원문 도구 風船; 원문 네 기술 ムーンフォース / 泡沫のアリア / 身代わり / 瞑想. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 6번, 화면 슬롯 3번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line); 원문 風船; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line); 원문 네 기술 ムーンフォース / 泡沫のアリア / 身代わり / 瞑想; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / アシレーヌ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "ability shown in on-screen party slot 3; 원문 げきりゅう; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot4-basculegion",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "basculegion",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — イダイトウ",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "こだわりスカーフ",
      "moves": [
        "퀵턴",
        "웨이브태클",
        "아쿠아제트",
        "お墓参り"
      ],
      "evsKnown": {
        "attack": 32,
        "spDefense": 2,
        "speed": 32
      },
      "actualStats": {
        "hp": 195,
        "attack": 164,
        "defense": 85,
        "spDefense": 97,
        "speed": 143
      },
      "actualStatsForm": "basculegion",
      "ability": "적응력"
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 4번, 원문 イダイトウ 195-164(32)-85-×-97(2)-143(+32). 원문 도구 こだわりスカーフ; 원문 네 기술 クイックターン / ウェーブタックル / アクアジェット / お墓参り. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 3번, 화면 슬롯 4번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); 원문 こだわりスカーフ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); 원문 네 기술 クイックターン / ウェーブタックル / アクアジェット / お墓参り; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / イダイトウ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "ability shown in on-screen party slot 4; 원문 てきおうりょく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot5-rillaboom",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "rillaboom",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — ゴリランダー",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ラムのみ",
      "moves": [
        "드럼어택",
        "剣の舞",
        "그래스슬라이더",
        "馬鹿力"
      ],
      "evsKnown": {
        "hp": 20,
        "attack": 32,
        "defense": 5,
        "speed": 9
      },
      "actualStats": {
        "hp": 195,
        "attack": 194,
        "defense": 115,
        "spDefense": 90,
        "speed": 114
      },
      "actualStatsForm": "rillaboom",
      "ability": "그래스메이커"
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 5번, 원문 ゴリランダー 195(20)-194(+32)-115(5)-×-90-114(9). 원문 도구 ラムのみ; 원문 네 기술 ドラムアタック / 剣の舞 / グラススライダー / 馬鹿力. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 5번, 화면 슬롯 5번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line); 원문 ラムのみ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line); 원문 네 기술 ドラムアタック / 剣の舞 / グラススライダー / 馬鹿力; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ゴリランダー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "ability shown in on-screen party slot 5; 원문 グラスメイカー; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6-slot6-archaludon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "archaludon",
    "title": "시즌 M-6 싱글 · 【M-6 最終6位】G線上の魔王 — ブリジュラス",
    "creator": "めろ (Claris_bradbury)",
    "rank": "작성자 공개 최종6위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "りゅうのキバ",
      "moves": [
        "流星群",
        "러스터캐논",
        "10万ボルト",
        "悪の波動"
      ],
      "evsKnown": {
        "hp": 30,
        "spAttack": 25,
        "spDefense": 1,
        "speed": 10
      },
      "actualStats": {
        "hp": 195,
        "defense": 150,
        "spAttack": 187,
        "spDefense": 86,
        "speed": 115
      },
      "actualStatsForm": "archaludon",
      "ability": "지구력"
    },
    "provenance": {
      "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "canonicalUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
      "sourceId": "blog-m6-6-Claris_bradbury:2026-10-07:M-6-6",
      "publishedAt": "2026-10-07",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【M-6 最終6位】G線上の魔王 / 작성자 めろ (Claris_bradbury), TN Dr.Latancy; 파티 화면 6번, 원문 ブリジュラス 195(30)-×-150-187(+25)-86(1)-115(10). 원문 도구 龍の牙; 원문 네 기술 流星群 / ラスターカノン / 10万ボルト / 悪の波動. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단. 원문 단락 순서 2번, 화면 슬롯 6번.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line); 원문 龍の牙; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line); 원문 네 기술 流星群 / ラスターカノン / 10万ボルト / 悪の波動; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "article section: 個体紹介 / ブリジュラス (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007205336.png",
          "location": "ability shown in on-screen party slot 6; 원문 じきゅうりょく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://claris-bradbury.hatenablog.com/entry/2026/10/07/%E3%80%90M-6_%E6%9C%80%E7%B5%826%E4%BD%8D%E3%80%91G%E7%B7%9A%E4%B8%8A%E3%81%AE%E9%AD%94%E7%8E%8B",
          "location": "원문 작성자/제목: 【M-6 最終6位】G線上の魔王",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://cdn-ak.f.st-hatena.com/images/fotolife/C/Claris_bradbury/20261007/20261007203229.png",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot1-mega-floette",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-floette",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — メガフラエッテ",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "フラエッテナイト",
      "moves": [
        "문포스",
        "명상",
        "애교부리기",
        "광합성"
      ],
      "evsKnown": {
        "hp": 26,
        "defense": 7,
        "spAttack": 1,
        "speed": 32
      },
      "actualStats": {
        "hp": 175,
        "attack": 94,
        "defense": 114,
        "spAttack": 176,
        "spDefense": 168,
        "speed": 169
      },
      "actualStatsForm": "mega-floette",
      "ability": "페어리오라",
      "nature": "timid",
      "preMegaAbilities": [
        "플라워베일"
      ]
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 1번, 원문 メガフラエッテ 175(26)-94-114(7)-176(1)-168-169(32). 원문 도구 フラエッテナイト; 원문 네 기술 ムーンフォース / めいそう / あまえる / こうごうせい. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님. 원문 마지막날 フラエッテ 기술, 전날 구성 제외.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line); 원문 フラエッテナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line); 원문 네 기술 ムーンフォース / めいそう / あまえる / こうごうせい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line); 원문 フェアリーオーラ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / メガフラエッテ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot2-hippowdon",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "hippowdon",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — カバルドン",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ゴツゴツメット",
      "moves": [
        "지진",
        "얼음엄니",
        "하품",
        "태만함"
      ],
      "evsKnown": {
        "hp": 32,
        "defense": 32,
        "spDefense": 1,
        "speed": 1
      },
      "actualStats": {
        "hp": 215,
        "attack": 132,
        "defense": 187,
        "spAttack": 79,
        "spDefense": 93,
        "speed": 68
      },
      "actualStatsForm": "hippowdon",
      "ability": "모래날림",
      "nature": "impish"
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 2번, 원문 カバルドン 215(32)-132-187(32)-79-93(1)-68(1). 원문 도구 ゴツゴツメット; 원문 네 기술 じしん / こおりのキバ / あくび / なまける. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line); 원문 ゴツゴツメット; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line); 원문 네 기술 じしん / こおりのキバ / あくび / なまける; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line); 원문 すなおこし; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / カバルドン (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot3-samurott-hisui",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "samurott-hisui",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — ダイケンキ(ヒスイ)",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ラムのみ",
      "moves": [
        "비검천중파",
        "아쿠아커터",
        "칼춤",
        "기습"
      ],
      "evsKnown": {
        "hp": 18,
        "attack": 32,
        "defense": 2,
        "spDefense": 6,
        "speed": 8
      },
      "actualStats": {
        "hp": 183,
        "attack": 176,
        "defense": 102,
        "spAttack": 108,
        "spDefense": 91,
        "speed": 113
      },
      "actualStatsForm": "samurott-hisui",
      "ability": "예리함",
      "nature": "adamant"
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 3번, 원문 ダイケンキ(ヒスイ) 183(18)-176(32)-102(2)-108-91(6)-113(8). 원문 도구 ラムのみ; 원문 네 기술 ひけん・ちえなみ / アクアカッター / つるぎのまい / ふいうち. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line); 원문 ラムのみ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line); 원문 네 기술 ひけん・ちえなみ / アクアカッター / つるぎのまい / ふいうち; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line); 원문 きれあじ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ダイケンキ(ヒスイ) (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot4-toxapex",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "toxapex",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — ドヒドイデ",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "엉겨붙기",
        "맹독",
        "흑안개",
        "HP회복"
      ],
      "evsKnown": {
        "hp": 32,
        "defense": 10,
        "spDefense": 24
      },
      "actualStats": {
        "hp": 157,
        "attack": 74,
        "defense": 200,
        "spAttack": 73,
        "spDefense": 186,
        "speed": 55
      },
      "actualStatsForm": "toxapex",
      "ability": "재생력",
      "nature": "bold"
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 4번, 원문 ドヒドイデ 157(32)-74-200(10)-73-186(24)-55. 원문 도구 たべのこし; 원문 네 기술 まとわりつく / どくどく / くろいきり / じこさいせい. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line); 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line); 원문 네 기술 まとわりつく / どくどく / くろいきり / じこさいせい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line); 원문 さいせいりょく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ドヒドイデ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot5-mega-garchomp-z",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "mega-garchomp-z",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — ガブリアスZ",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ガブリアスナイトZ",
      "moves": [
        "용성군",
        "대지의힘",
        "화염방사",
        "스텔스록"
      ],
      "evsKnown": {
        "hp": 2,
        "spAttack": 32,
        "speed": 32
      },
      "actualStats": {
        "hp": 185,
        "attack": 135,
        "defense": 105,
        "spAttack": 193,
        "spDefense": 105,
        "speed": 223
      },
      "actualStatsForm": "mega-garchomp-z",
      "ability": "부유",
      "nature": "timid",
      "preMegaAbilities": [
        "까칠한피부"
      ]
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 5번, 원문 ガブリアスZ 185(2)-135-105-193(32)-105-223(32). 원문 도구 ガブリアスナイトZ; 원문 네 기술 りゅうせいぐん / だいちのちから / かえんほうしゃ / ステルスロック. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line); 원문 ガブリアスナイトZ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line); 원문 네 기술 りゅうせいぐん / だいちのちから / かえんほうしゃ / ステルスロック; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line); 원문 ふゆう; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.preMegaAbilities": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / ガブリアスZ (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-7-Muu_poke:2026-10-08:204225-slot6-gholdengo",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "gholdengo",
    "title": "시즌 M-6 싱글 · 【S-6】最終7位 轟竜エッテガブZ — サーフゴー",
    "creator": "ムー (Muu_poke)",
    "rank": "작성자 공개 최종7위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "こだわりスカーフ",
      "moves": [
        "섀도볼",
        "골드러시",
        "트릭",
        "HP회복"
      ],
      "evsKnown": {
        "hp": 1,
        "defense": 1,
        "spAttack": 32,
        "speed": 32
      },
      "actualStats": {
        "hp": 163,
        "attack": 72,
        "defense": 116,
        "spAttack": 185,
        "spDefense": 111,
        "speed": 149
      },
      "actualStatsForm": "gholdengo",
      "ability": "황금몸",
      "nature": "timid"
    },
    "provenance": {
      "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "canonicalUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
      "sourceId": "blog-m6-7-Muu_poke:2026-10-08:204225",
      "publishedAt": "2026-10-08",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 【S-6】最終7位 轟竜エッテガブZ / 작성자 ムー (Muu_poke), TN ray; 파티 화면 6번, 원문 サーフゴー 163(1)-72-116(1)-185(32)-111-149(32). 원문 도구 こだわりスカーフ; 원문 네 기술 シャドーボール / ゴールドラッシュ / トリック / じこさいせい. 작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line); 원문 こだわりスカーフ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line); 원문 네 기술 シャドーボール / ゴールドラッシュ / トリック / じこさいせい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line); only parenthesized values are explicit",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line); 원문 おうごんのからだ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "article section: 【固体紹介】 / サーフゴー (heading, held item, following stat line, following move line)",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://muu-poke.hatenablog.com/entry/2026/10/08/204225",
          "location": "원문 작성자/제목: 【S-6】最終7位 轟竜エッテガブZ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://pbs.twimg.com/media/HUAgl4QbkAAwaGj?format=jpg&name=large",
          "location": "작성자 게시 게임 최종 결과 화면; 공식 순위 독립 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot1-scovillain",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "scovillain",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — スコヴィラン",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "たべのこし",
      "moves": [
        "화염방사",
        "씨뿌리기",
        "방어",
        "대타출동"
      ],
      "evsKnown": {
        "hp": 5,
        "defense": 32,
        "spDefense": 18,
        "speed": 11
      },
      "actualStats": {
        "hp": 145,
        "attack": 115,
        "defense": 117,
        "spAttack": 128,
        "spDefense": 103,
        "speed": 116
      },
      "actualStatsForm": "scovillain",
      "ability": "변덕쟁이",
      "nature": "timid"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 1번, 원문 スコヴィラン 145(5)-115-117(32)-128-103(18)-116(11). 원문 도구 たべのこし; 원문 네 기술 かえんほうしゃ / やどりぎのタネ / まもる / みがわり. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트; 원문 たべのこし; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 かえんほうしゃ / やどりぎのタネ / まもる / みがわり; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트; 원문 ムラっけ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → スコヴィラン @ たべのこし → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot2-sneasler",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "sneasler",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — オオニューラ",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ノーマルジュエル",
      "moves": [
        "페이탈클로",
        "인파이트",
        "속이다",
        "칼춤"
      ],
      "evsKnown": {
        "hp": 28,
        "attack": 10,
        "spDefense": 28
      },
      "actualStats": {
        "hp": 183,
        "attack": 176,
        "defense": 80,
        "spAttack": 54,
        "spDefense": 128,
        "speed": 140
      },
      "actualStatsForm": "sneasler",
      "ability": "곡예",
      "nature": "adamant"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 2번, 원문 オオニューラ 183(28)-176(10)-80-54-128(28)-140. 원문 도구 ノーマルジュエル; 원문 네 기술 フェイタルクロー / インファイト / ねこだまし / つるぎのまい. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트; 원문 ノーマルジュエル; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 フェイタルクロー / インファイト / ねこだまし / つるぎのまい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트; 원문 かるわざ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → オオニューラ @ ノーマルジュエル → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot3-gholdengo",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "gholdengo",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — サーフゴー",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "サイコシード",
      "moves": [
        "10만볼트",
        "사이코쇼크",
        "나쁜음모",
        "HP회복"
      ],
      "evsKnown": {
        "hp": 31,
        "spAttack": 6,
        "spDefense": 29
      },
      "actualStats": {
        "hp": 193,
        "attack": 72,
        "defense": 115,
        "spAttack": 159,
        "spDefense": 154,
        "speed": 104
      },
      "actualStatsForm": "gholdengo",
      "ability": "황금몸",
      "nature": "calm"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 3번, 원문 サーフゴー 193(31)-72-115-159(6)-154(29)-104. 원문 도구 サイコシード; 원문 네 기술 １０まんボルト / サイコショック / わるだくみ / じこさいせい. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트; 원문 サイコシード; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 １０まんボルト / サイコショック / わるだくみ / じこさいせい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트; 원문 おうごんのからだ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → サーフゴー @ サイコシード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot4-gyarados",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "gyarados",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — ギャラドス",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "ギャラドスナイト",
      "moves": [
        "지진",
        "얼음엄니",
        "도발",
        "용의춤"
      ],
      "evsKnown": {
        "hp": 9,
        "attack": 25,
        "speed": 32
      },
      "actualStats": {
        "hp": 179,
        "attack": 187,
        "defense": 99,
        "spAttack": 72,
        "spDefense": 120,
        "speed": 133
      },
      "actualStatsForm": "gyarados",
      "ability": "위협",
      "nature": "adamant"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 4번, 원문 ギャラドス 179(9)-187(25)-99-72-120-133(32). 원문 도구 ギャラドスナイト; 원문 네 기술 じしん / こおりのキバ / ちょうはつ / りゅうのまい. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님. 원본 베이스 갸라도스 실능·위협: 메가 진화 후 실능/특성은 미확인. 갸라도스나이트/위협 특성 및 글의 「メガ後」 구분: 적힌 실능력치는 진화 전 갸라도스; 메가갸라도스 능력치로 전용하지 않음. 표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트; 원문 ギャラドスナイト; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 じしん / こおりのキバ / ちょうはつ / りゅうのまい; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트; 원문 いかく; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ギャラドス @ ギャラドスナイト → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot5-bellibolt",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "bellibolt",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — ハラバリー",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "レッドカード",
      "moves": [
        "10만볼트",
        "파라볼라차지",
        "애시드봄",
        "태만함"
      ],
      "evsKnown": {
        "hp": 31,
        "defense": 9,
        "spDefense": 26
      },
      "actualStats": {
        "hp": 215,
        "attack": 75,
        "defense": 132,
        "spAttack": 123,
        "spDefense": 129,
        "speed": 65
      },
      "actualStatsForm": "bellibolt",
      "ability": "전기로바꾸기",
      "nature": "bold"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 5번, 원문 ハラバリー 215(31)-75-132(9)-123-129(26)-65. 원문 도구 レッドカード; 원문 네 기술 １０まんボルト / パラボラチャージ / アシッドボム / なまける. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트; 원문 レッドカード; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 １０まんボルト / パラボラチャージ / アシッドボム / なまける; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트; 원문 でんきにかえる; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ハラバリー @ レッドカード → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  },
  {
    "id": "blog-m6-9-tixyoca-2026-10-08-163644-slot6-gengar",
    "contentKind": "party",
    "partySize": 6,
    "language": "ja",
    "format": "singles",
    "platform": "blog",
    "pokemonKey": "gengar",
    "title": "시즌 M-6 싱글 · M-6 最終9位　スコさんほんまスコ — ゲンガー",
    "creator": "チョカ (id:tixyoca)",
    "rank": "작성자 공개 최종9위",
    "status": "partial",
    "build": null,
    "partialBuild": {
      "item": "きあいのタスキ",
      "moves": [
        "병상첨병",
        "얼다바람",
        "독압정",
        "전기자석파"
      ],
      "evsKnown": {
        "hp": 1,
        "defense": 1,
        "spAttack": 32,
        "speed": 32
      },
      "actualStats": {
        "hp": 136,
        "attack": 76,
        "defense": 81,
        "spAttack": 182,
        "spDefense": 95,
        "speed": 178
      },
      "actualStatsForm": "gengar",
      "ability": "저주받은바디",
      "nature": "timid"
    },
    "provenance": {
      "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "canonicalUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
      "sourceId": "blog-m6-9-tixyoca-2026-10-08-163644",
      "publishedAt": "2026-10-08T07:36:44Z",
      "collectedAt": "2026-10-18",
      "verifiedAt": "2026-10-18",
      "evidence": "원문 M-6 最終9位　スコさんほんまスコ / 작성자 チョカ (id:tixyoca), TN EGOIST; 파티 화면 6번, 원문 ゲンガー 136(1)-76-81(1)-182(32)-95-178(32). 원문 도구 きあいのタスキ; 원문 네 기술 たたりめ / こごえるかぜ / どくびし / でんじは. 원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님.  표기 없는 노력 포인트/특성/성격은 추정하지 않음; 원문 일본어 기술/도구의 앱 정규 별칭 및 전체 필드가 모두 검증된 상태가 아니므로 완성형 가져오기 차단.",
      "fields": {
        "pokemonKey": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.item": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트; 원문 きあいのタスキ; 정규화 대조 championsItems.ts/PokeAPI item_names.csv(메가 신형 도구는 원문 슬롯·로스터형 대응)",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.moves": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트; 원문 네 기술 たたりめ / こごえるかぜ / どくびし / でんじは; 정규화 대조 dexDescriptions.json/PokeAPI move_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.evsKnown": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStats": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.actualStatsForm": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.ability": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트; 원문 のろわれボディ; dexDescriptions.json/PokeAPI ability_names.csv",
          "checkedAt": "2026-10-18"
        },
        "partialBuild.nature": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "個体紹介 → ゲンガー @ きあいのタスキ → 特性/能力補正/실능력치/기술 텍스트",
          "checkedAt": "2026-10-18"
        },
        "creator": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "title": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 작성자/제목: M-6 最終9位　スコさんほんまスコ",
          "checkedAt": "2026-10-18"
        },
        "format": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 M-6 싱글 및 결과 화면",
          "checkedAt": "2026-10-18"
        },
        "rank": {
          "sourceUrl": "https://tixyoca.hatenablog.com/entry/2026/10/08/163644",
          "location": "원문 結果 작성자 게시 최종9위; 독립 공식 순위 검증 아님",
          "checkedAt": "2026-10-18"
        }
      }
    }
  }
]
