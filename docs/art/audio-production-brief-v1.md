# 《云水江湖》Audio Production Brief v1

> 项目：Inkblade: Tales of Jianghu / 《云水江湖》  
> 目标：为二游/卡牌战斗爽感方向制作角色战斗语音、攻击/效果牌音效、UI 音效与环境氛围。  
> 基于设定：`docs/云水江湖_世界观与背景故事设定文档_v0.3.md`、四名角色设定文档、`src/game/content/cards.ts`、`public/assets/audio/manifest.json`。  
> 资产阶段：MVP 音频包，可直接替换当前 procedural WebAudio fallback。

## 1. 声音总方向

核心听感：短、狠、亮、可反复听。

战斗语音应接近二游战斗 bark，而不是电影对白。每句要能在卡牌出手、伤害数字、敌人反馈之间快速完成，不抢玩家节奏。

| 类型 | 时长 | 表演要求 |
|---|---:|---|
| 普攻/随机出牌 | 0.7-1.4s | 轻快、短促、有辨识度 |
| 技能牌/效果牌 | 1.0-1.8s | 带招式名或状态关键词 |
| 稀有牌/终结牌 | 1.6-2.6s | 更高情绪，允许喊招 |
| 受击/低血 | 0.5-1.2s | 克制，不做长惨叫 |
| 胜利 | 1.2-2.2s | 有角色态度，但不拖长 |

全局禁忌：

- 不要长篇对白。
- 不要旁白腔。
- 不要现代口语、网络梗、英文夹杂。
- 不要过度真实血腥、恐怖尖叫。
- 不要模仿真人演员、名人、现有 IP 声线。
- 不要让环境声和语音同时占满中频；语音必须永远可读。

## 2. 推荐制作工具

| 用途 | 首选 | 说明 |
|---|---|---|
| 角色语音生成 | Microsoft Edge TTS / `edge-tts` | 免费、可批量，适合战斗 bark 原型 |
| 角色语音精修 | Audacity | 免费开源，适合裁剪、压缩、EQ、去爆音 |
| 短音效来源 | Freesound | 免费素材库，适合打击、格挡、状态、UI cue |
| 环境声来源 | Freesound + 自制循环 | 先用免费素材拼接，再在 Audacity 里做无缝循环 |
| 批量后期/导出 | Audacity | 免费开源，足够完成首批资产整理 |
| 可选升级 | ElevenLabs / Stable Audio / REAPER | 预算允许时再用，当前不作为依赖 |

免费优先顺序：

1. 先用 `edge-tts` 生成所有角色 bark 和技能喊招。
2. 先从 Freesound 找到能直接用的打击、格挡、环境底噪。
3. 用 Audacity 做裁剪、响度统一、淡入淡出、循环点修补。
4. 只有在免费素材明显不够时，再考虑付费升级。

## 3. 技术规格

| 项目 | 规格 |
|---|---|
| 源文件 | WAV, 48kHz, 24-bit preferred |
| 游戏交付 | OGG Vorbis preferred, MP3 fallback |
| 短 SFX | mono 或 narrow stereo |
| 环境声 | stereo seamless loop |
| 语音响度 | 约 -18 LUFS integrated，峰值不超过 -1 dBTP |
| SFX 响度 | 约 -16 至 -14 LUFS，峰值不超过 -1 dBTP |
| 环境声响度 | 约 -28 至 -24 LUFS，必须低于语音和 SFX |
| 文件命名 | lowercase kebab-case，角色名用英文 id |

后期建议：

- 所有语音开头保留 20-60ms 气口，结尾淡出 40-80ms。
- 战斗 bark 可做轻压缩，保留瞬态，不要广播广告感。
- 攻击 SFX 需要清楚的起音和尾音，不要糊成一片。
- 环境 loop 必须测试 3 次循环，不能有明显断点。

## 4. 目录与命名

```text
public/assets/audio/
  voice/
    zhaoyun/
      zhaoyun-bark-01.ogg
      zhaoyun-attack-01.ogg
      zhaoyun-skill-guard-01.ogg
      zhaoyun-ultimate-01.ogg
    diaochan/
    caiwenji/
    zhugeliang/
  sfx/
    card-attack.ogg
    card-skill.ogg
    card-mind.ogg
    card-ink.ogg
    combat-hit-spear.ogg
    combat-hit-blade.ogg
    combat-block.ogg
    combat-status-charm.ogg
    combat-status-cleanse.ogg
    combat-status-formation.ogg
    combat-status-ink.ogg
    combat-turn.ogg
    ui-confirm.ogg
    ui-deny.ogg
    victory.ogg
    defeat.ogg
  ambience/
    title-loop.ogg
    map-loop.ogg
    combat-luoshui-loop.ogg
    combat-bamboo-loop.ogg
    combat-changan-loop.ogg
    combat-ink-abyss-loop.ogg
    event-loop.ogg
    shop-loop.ogg
    rest-loop.ogg
    final-loop.ogg
```

## 5. 角色声线设计

### 5.1 赵云：白龙破阵

声线：年轻将军，明亮、清正、坚定。二游爽感可以高能，但不能鲁莽狂吼。

Voice Design prompt:

```text
Energetic anime-style Chinese male hero voice for a wuxia card battle game. Young general, bright and resolute, heroic but restrained, clear Mandarin, fast decisive delivery, strong attack callouts, clean studio quality, no narration, no old-man tone.
```

生成参数建议：

| 参数 | 建议 |
|---|---|
| Stability | 40-55 |
| Similarity | 70-85 |
| Style / Exaggeration | 35-55 |
| Speed | 1.02-1.10 |

台词清单：

| 文件名 | 文本 | 触发 |
|---|---|---|
| `zhaoyun-bark-01` | 枪至！ | 随机出牌 |
| `zhaoyun-bark-02` | 破！ | 随机出牌 |
| `zhaoyun-bark-03` | 开路！ | 随机出牌 |
| `zhaoyun-bark-04` | 随我突阵！ | 随机出牌 |
| `zhaoyun-attack-01` | 白龙探爪！ | `zhao_white_dragon` |
| `zhaoyun-attack-02` | 长枪破风！ | 攻击牌 |
| `zhaoyun-attack-03` | 七进七出！ | `zhao_seven_entries` |
| `zhaoyun-attack-04` | 云龙穿阵！ | `zhao_cloud_pierce` |
| `zhaoyun-guard-01` | 我来挡。 | 防御牌 |
| `zhaoyun-guard-02` | 守住阵线！ | `zhao_guard` |
| `zhaoyun-guard-03` | 白袍护誓！ | `zhao_oath_guard` |
| `zhaoyun-lowhp-01` | 此路不退！ | 低血 |
| `zhaoyun-ultimate-01` | 一枪，定生死！ | 稀有攻击 |
| `zhaoyun-ultimate-02` | 白龙破阵！ | 破阵/终结 |
| `zhaoyun-victory-01` | 生路已开。 | 胜利 |

### 5.2 貂蝉：闭月舞影

声线：优雅、轻快、锋利，有一点玩味的危险。不能过度妩媚，要像“以美为刃”的战斗角色。

Voice Design prompt:

```text
Stylish anime-style Chinese female assassin-dancer voice. Elegant, sharp, confident, playful danger, clear Mandarin, quick battle callouts, graceful but lethal, not overly seductive, clean studio quality.
```

生成参数建议：

| 参数 | 建议 |
|---|---|
| Stability | 35-50 |
| Similarity | 70-85 |
| Style / Exaggeration | 45-65 |
| Speed | 1.05-1.14 |

台词清单：

| 文件名 | 文本 | 触发 |
|---|---|---|
| `diaochan-bark-01` | 看这里。 | 随机出牌 |
| `diaochan-bark-02` | 太慢了。 | 随机出牌 |
| `diaochan-bark-03` | 红绫起。 | 随机出牌 |
| `diaochan-bark-04` | 别眨眼。 | 随机出牌 |
| `diaochan-attack-01` | 袖中刃！ | `diao_sleeve_blade` |
| `diaochan-attack-02` | 惊鸿一击！ | `diao_jinghong_strike` |
| `diaochan-attack-03` | 莲步藏锋！ | `diao_lotus_blade` |
| `diaochan-attack-04` | 月下回旋！ | `diao_moonstep` |
| `diaochan-charm-01` | 心乱了吗？ | 魅惑 |
| `diaochan-charm-02` | 此局，由我牵。 | 控制 |
| `diaochan-charm-03` | 离间！ | `diao_lijian` |
| `diaochan-charm-04` | 绫罗缚心！ | `diao_silk_snare` |
| `diaochan-lowhp-01` | 舞，还未终。 | 低血 |
| `diaochan-ultimate-01` | 闭月回风！ | `diao_closed_moon` |
| `diaochan-ultimate-02` | 这一舞，送你入局。 | 终结 |
| `diaochan-victory-01` | 局散，人醒。 | 胜利 |

### 5.3 蔡文姬：清音渡魂

声线：温柔、清亮、悲悯，但战斗时要有音刃的锋利。支持语音温和，攻击语音突然变亮。

Voice Design prompt:

```text
Anime-style Chinese female guqin spellcaster voice. Gentle but battle-ready, clear and bright Mandarin, musical rhythm, emotional power, calm support callouts with sudden sharpness on attack lines, clean studio quality.
```

生成参数建议：

| 参数 | 建议 |
|---|---|
| Stability | 45-60 |
| Similarity | 70-85 |
| Style / Exaggeration | 35-55 |
| Speed | 0.98-1.08 |

台词清单：

| 文件名 | 文本 | 触发 |
|---|---|---|
| `caiwenji-bark-01` | 听弦。 | 随机出牌 |
| `caiwenji-bark-02` | 拂弦。 | 随机出牌 |
| `caiwenji-bark-03` | 音起。 | 随机出牌 |
| `caiwenji-bark-04` | 莫惊。 | 随机出牌 |
| `caiwenji-attack-01` | 断弦！ | `cai_broken_string` |
| `caiwenji-attack-02` | 胡笳一拍！ | `cai_hujia_beat` |
| `caiwenji-attack-03` | 清音化刃！ | 琴音攻击 |
| `caiwenji-attack-04` | 余响未绝！ | 余韵 |
| `caiwenji-cleanse-01` | 清心。 | `cai_qingxin_song` |
| `caiwenji-cleanse-02` | 杂音，散。 | 净化 |
| `caiwenji-cleanse-03` | 此曲护身。 | 防御 |
| `caiwenji-cleanse-04` | 洗雨调！ | `cai_cleansing_rain` |
| `caiwenji-lowhp-01` | 弦未断，曲未终。 | 低血 |
| `caiwenji-ultimate-01` | 五音归一！ | 五音/终曲 |
| `caiwenji-ultimate-02` | 这一曲，渡你归去。 | `cai_soul_ferry` |
| `caiwenji-victory-01` | 悲声，暂歇。 | 胜利 |

### 5.4 诸葛亮：卧龙观星

声线：冷静、聪明、指挥感强。普通语音短且轻，终结时突然抬起能量。

Voice Design prompt:

```text
Anime-style Chinese male strategist voice. Calm but commanding, intelligent, composed, clear Mandarin, precise tactical battle callouts, quiet confidence with explosive emphasis on ultimate lines, clean studio quality.
```

生成参数建议：

| 参数 | 建议 |
|---|---|
| Stability | 50-65 |
| Similarity | 70-85 |
| Style / Exaggeration | 30-50 |
| Speed | 0.96-1.05 |

台词清单：

| 文件名 | 文本 | 触发 |
|---|---|---|
| `zhugeliang-bark-01` | 落子。 | 随机出牌 |
| `zhugeliang-bark-02` | 已知。 | 随机出牌 |
| `zhugeliang-bark-03` | 风起。 | 随机出牌 |
| `zhugeliang-bark-04` | 可破。 | 随机出牌 |
| `zhugeliang-attack-01` | 羽扇！ | `zhuge_fan_strike` |
| `zhugeliang-attack-02` | 星落！ | `zhuge_starfall` |
| `zhugeliang-attack-03` | 火阵，起！ | `zhuge_fire_array` |
| `zhugeliang-attack-04` | 借风！ | `zhuge_borrow_wind` |
| `zhugeliang-strategy-01` | 观星。 | `zhuge_observe_stars` |
| `zhugeliang-strategy-02` | 阵位已定。 | 阵法 |
| `zhugeliang-strategy-03` | 八阵展开。 | `zhuge_small_eight_array` |
| `zhugeliang-strategy-04` | 计定。 | `zhuge_plan_set` |
| `zhugeliang-lowhp-01` | 局未尽，不可乱。 | 低血 |
| `zhugeliang-ultimate-01` | 东风已至！ | 借风/爆发 |
| `zhugeliang-ultimate-02` | 此局，终了。 | 终结 |
| `zhugeliang-victory-01` | 胜负，已在局中。 | 胜利 |

## 6. 卡牌与战斗 SFX

短音效优先使用 Freesound 搜索和筛选。提示词尽量写清：sound source、texture、duration、no voice、no music、game cue。

| 文件名 | 用途 | Prompt |
|---|---|---|
| `card-attack` | 通用攻击牌 | `Search terms: wuxia slash, brush whoosh, paper hit, impact snap, 0.5-1s, no voice.` |
| `card-skill` | 通用技能牌 | `Search terms: magical card flick, ink swirl, soft chime, tactical UI, 0.5-1s, no voice.` |
| `card-mind` | 心境牌 | `Search terms: heartbeat pulse, glass chime, ink ripple, mystical, 0.5-1s, no voice.` |
| `card-ink` | 墨牌 | `Search terms: dark ink spread, reverse brush stroke, ominous pulse, 0.8-1.2s, no voice.` |
| `combat-hit-spear` | 赵云枪击 | `Search terms: spear thrust, fast metal whoosh, heroic impact, 0.7-1s, no voice.` |
| `combat-hit-blade` | 刀刃/袖刃命中 | `Search terms: blade slice, silk whip, fan snap, elegant impact, 0.7-1s, no voice.` |
| `combat-hit-qin` | 琴音命中 | `Search terms: guqin pluck, magical resonance, clean hit, 0.8-1.2s, no voice.` |
| `combat-block` | 格挡/护甲 | `Search terms: block, guard, wood and metal impact, crisp defense cue, 0.5-0.8s, no voice.` |
| `combat-status-charm` | 魅惑/离间 | `Search terms: silk swish, fan snap, bell shimmer, charm status, 0.8-1.2s, no voice.` |
| `combat-status-cleanse` | 清心/净化 | `Search terms: purification chime, guqin harmonic, ink dissolving, 0.8-1.2s, no voice.` |
| `combat-status-formation` | 阵法 | `Search terms: bagua array, feather fan sweep, wind chime, formation magic, 1-1.5s, no voice.` |
| `combat-status-ink` | 墨痕/负面 | `Search terms: wet ink crawling, low bass swell, brush scratch, dark corruption, 0.8-1.2s, no voice.` |
| `combat-turn` | 回合切换 | `Search terms: page flip, soft drum tick, brush sweep, turn transition, 0.5-0.8s, no voice.` |
| `ui-confirm` | UI 确认 | `Search terms: paper click, bamboo tap, tiny chime, UI confirm, 0.2-0.3s, no voice.` |
| `ui-deny` | 能量不足/不可用 | `Search terms: muted knock, soft low chime, deny feedback, 0.2-0.3s, no voice.` |
| `victory` | 胜利 | `Search terms: short victory sting, guqin flourish, bright cymbal shimmer, 1.5-2.5s, no voice.` |
| `defeat` | 失败 | `Search terms: low guqin string, distant drum, fading black rain, defeat sting, 1.5-3s, no voice.` |

## 7. 角色专属 SFX Layer

这些不是必须独立播放的完整音效，可以叠在 `card-attack` 或 `combat-hit-*` 上，做角色辨识。

| 文件名 | 用途 | Prompt |
|---|---|---|
| `layer-zhaoyun-dragon-wind` | 赵云攻击尾音 | `Search terms: dragon wind, spear trail, heroic air, no impact, no voice.` |
| `layer-diaochan-silk-fan` | 貂蝉技能尾音 | `Search terms: silk ribbon, fan snap, petal shimmer, graceful motion, no impact, no voice.` |
| `layer-caiwenji-guqin-ripple` | 蔡文姬技能尾音 | `Search terms: guqin resonance, soft string harmonic, water ripple, no impact, no voice.` |
| `layer-zhugeliang-star-array` | 诸葛亮阵法尾音 | `Search terms: star array, feather fan sweep, astral chime, no impact, no voice.` |

## 8. 环境声与音乐氛围

环境声优先用 Freesound 搜索可循环的底噪、雨声、风声、琴声，再在 Audacity 里拼成 loop。若免费素材不足，再考虑付费生成。

| 文件名 | 场景 | Prompt |
|---|---|---|
| `title-loop` | 标题 | `Search terms: river wind, soft guqin, rain on paper, mysterious calm, seamless loop.` |
| `map-loop` | 路线图 | `Search terms: journey ambience, bamboo wind, soft drum pulse, ink brush texture, seamless loop.` |
| `combat-luoshui-loop` | 洛水残照战斗 | `Search terms: dark river, black rain, low drums, guqin accent, battlefield tension, seamless loop.` |
| `combat-bamboo-loop` | 竹林战斗 | `Search terms: bamboo forest wind, muted drums, ghostly guqin, leaf rustle, seamless loop.` |
| `combat-changan-loop` | 长安战斗 | `Search terms: ruined city bells, wind through empty streets, low drums, dark fantasy ambience, seamless loop.` |
| `combat-ink-abyss-loop` | 墨渊终章 | `Search terms: ink ocean rumble, reversed brush, broken choir texture, low cinematic tension, seamless loop.` |
| `event-loop` | 奇遇 | `Search terms: rain pavilion, paper lanterns, soft guqin fragments, mysterious calm, seamless loop.` |
| `shop-loop` | 商店 | `Search terms: wooden beads, coin clinks, room tone, wet market under rain, seamless loop.` |
| `rest-loop` | 休整 | `Search terms: small fire, light rain, bamboo wind, soft guqin, healing ambience, seamless loop.` |
| `final-loop` | 结局/最终选择 | `Search terms: slow guqin drone, black rain fading, solemn wind, final choice ambience, seamless loop.` |

## 9. 接入优先级

MVP 第一批：

1. 每个角色 8 条：4 条随机出牌、2 条攻击、1 条终结、1 条胜利。
2. 通用 SFX 8 个：`card-attack`、`card-skill`、`card-ink`、`combat-hit-spear`、`combat-hit-blade`、`combat-block`、`combat-turn`、`ui-confirm`。
3. 环境 loop 4 个：`title-loop`、`map-loop`、`combat-luoshui-loop`、`event-loop`。

MVP 第二批：

1. 补齐四名角色所有表内台词。
2. 加入角色专属 SFX layer。
3. 补齐章节环境 loop。
4. 更新 `public/assets/audio/manifest.json`，将 fallback id 指向真实文件并保留 procedural fallback。

## 10. QA 清单

- 语音在战斗 SFX 和环境声上方仍然清楚。
- 同一角色连续播放 10 条语音，不出现明显音色漂移。
- 每条 bark 在 2 秒内完成，终结语音不超过 2.6 秒。
- 每个 SFX 在第一次听时能分辨用途：攻击、格挡、状态、UI、回合。
- 环境 loop 连续播放 3 次没有断点、爆音、突兀重拍。
- 低音不过量，浏览器小音箱仍能听见关键攻击瞬态。
- 导出文件名与 manifest key 一致。

## 11. 许可与署名注意

- 不使用任何真实演员、主播、名人或已有角色声线作为参考。
- 若用 Freesound 或外部素材，只使用允许商业项目的许可证，并记录作者、URL、license。
- 先把免费方案做成可用版本，再考虑 AI 付费平台做升级包。
- 保留所有源 prompt、生成日期、平台、模型、voice id、导出参数，方便后续重做同声线资产。
