# 奇遇资产绑定二次审查报告

审查依据：
- 游戏事件定义：`src/game/content/events.ts`
- 墨录图鉴条目：`src/game/content/logbook.ts`
- 美术交付文档：`docs/art/event-art-prompts-v1.md`
- 实际资产目录：`public/assets/generated/events/`

结论：游戏 UI 的绑定逻辑是按 `eventId` 直接拼接 `/assets/generated/events/${eventId}.png`，没有额外手写映射表；错位来源主要是资产文件名与画面内容不匹配。

## 修复记录

已修复 2026-05-16 二次审查发现的问题：

- 原始 45 张事件图已备份到 `output/event-asset-audit/backup-before-fix/`。
- 已按下方错位明细将 10 张互相串位的 PNG 复制回正确 `eventId` 文件名。
- 已替换混入的 `event_silk_lantern_market.png` 红衣动作序列图，当前为红灯夜市场景。
- 已为缺失的 `event_bamboo_soldier_array.png` 合成 1280 x 720 的竹林兵卒阵列场景。
- 修复后复核图已生成到 `output/event-asset-audit/all-events-contact-sheet-after-fix.jpg`。

## 总览

- 总资产：45 张，均为 1280 x 720 PNG。
- 修复前明确匹配：34 张。
- 修复前明确错位：11 张。
- 修复前缺失资产：1 张，真正的 `event_bamboo_soldier_array` / 兵煞竹阵静态奇遇图未在当前目录中找到。
- 修复前混入非奇遇图：1 张，当前 `event_silk_lantern_market.png` 是红衣角色动作序列图，不是 16:9 场景图。
- 修复后状态：45 张均为 1280 x 720 PNG，且按当前复核图与事件语义对齐。

## 错位明细与建议对齐

| 目标事件 ID | 目标名称 | 目标视觉核心 | 当前文件画面 | 应使用的现有文件 |
| --- | --- | --- | --- | --- |
| `event_bamboo_heart_question` | 竹林问心 | 竹林中角色面对自身影子/月光 | 当前是茶亭、棋盘、茶具 | `event_bamboo_soldier_array.png` |
| `event_bamboo_soldier_array` | 兵煞竹阵 | 竹林中兵卒/阵列/肃杀雨雾 | 当前像竹林问心，单人对黑影 | 已用现有竹兵素材合成新静态图 |
| `event_black_lotus_pool` | 黑莲池 | 黑色莲池、白色莲花 | 当前是树根湿信 | `event_ruined_temple_night_qin.png` |
| `event_deserted_armory` | 荒营兵库 | 荒废军营、兵器、甲胄 | 当前是渔夫孤舟 | `event_silent_bridge.png` |
| `event_fisher_old_song` | 渔叟旧歌 | 老渔夫、小舟、洛水 | 当前像雨中碑/石碑废墟 | `event_deserted_armory.png` |
| `event_rain_tea_pavilion` | 雨中茶亭 | 竹林茶亭、棋局、茶具 | 当前像荒寺/琴案 | `event_bamboo_heart_question.png` |
| `event_rain_washed_tablet` | 雨洗墨碑 | 雨中石碑、墨痕/碑名 | 当前是红灯夜市 | `event_fisher_old_song.png` |
| `event_red_sleeve_letter` | 红袖残书 | 树根湿信、红袖/残书 | 当前是窄桥/断桥 | `event_black_lotus_pool.png` |
| `event_ruined_temple_night_qin` | 荒寺夜琴 | 荒寺竹林、古琴、断弦 | 当前是白莲池 | `event_rain_tea_pavilion.png` |
| `event_silent_bridge` | 无声石桥 | 雾中石桥/孤桥 | 当前是军械兵器 | `event_red_sleeve_letter.png` |
| `event_silk_lantern_market` | 绛灯夜市 | 夜市、红灯、行人/摊市 | 当前是红衣角色序列图 | `event_rain_washed_tablet.png` |

## 已匹配资产

以下资产画面与事件标题、事件描述、交付文档视觉核心基本一致：

- `event_bamboo_grave_song.png` / 竹下归歌
- `event_black_rain_ferry.png` / 黑雨渡口
- `event_broken_brush_altar.png` / 断笔祭坛
- `event_broken_name_register.png` / 残名簿
- `event_broken_spear_shrine.png` / 断枪古祠
- `event_broken_string_elder.png` / 断弦老人
- `event_changban_echo.png` / 长坂回声
- `event_cloud_water_dream.png` / 云水一梦
- `event_empty_city_wind.png` / 空城风声
- `event_faceless_stage.png` / 无面戏台
- `event_heart_mirror.png` / 照心水镜
- `event_ink_seller_contract.png` / 墨商契
- `event_lotus_reflection_stage.png` / 莲影回台
- `event_luoshui_mirror.png` / 洛水照影
- `event_mountain_pass_riddle.png` / 山隘问答
- `event_muddy_ferry_lantern.png` / 墨渡残灯
- `event_nameless_market.png` / 无面市集
- `event_old_roadside_inn.png` / 旧道客栈
- `event_palace_lantern_banquet.png` / 宫灯旧宴
- `event_qin_rain_pavilion.png` / 雨亭听弦
- `event_qingyin_lost_score.png` / 清音遗谱
- `event_red_cloth_faceless.png` / 红衣无面
- `event_red_dust_guest.png` / 红尘旧客
- `event_rewritten_history_street.png` / 逆写史街
- `event_river_bones_lantern.png` / 河骨灯
- `event_silent_training_yard.png` / 无声校场
- `event_spear_oath_pavilion.png` / 长槊誓亭
- `event_star_board_argument.png` / 星盘争局
- `event_star_board_camp.png` / 星盘军帐
- `event_unfinished_chessboard.png` / 未央棋局
- `event_unwritten_page.png` / 未写之页
- `event_white_horse_lost_path.png` / 白马失路
- `event_white_robed_stelae.png` / 白袍碑林
- `event_wordless_bamboo_scroll.png` / 无字竹简

## 原建议

1. 先按上表重命名/互换现有文件，能修复 10 个事件的错位。
2. 将当前 `event_silk_lantern_market.png` 这张红衣动作序列图移出 `public/assets/generated/events/`，避免被奇遇系统引用。
3. 重新生成或找回 `event_bamboo_soldier_array.png`：视觉核心应为“竹林、兵卒、阵列、雨雾、青黛墨色”，不要使用单人问心构图。
4. 修复后重新生成 contact sheet 复审；本次审查图在 `output/event-asset-audit/events-contact-sheet-1.jpg` 到 `events-contact-sheet-3.jpg`。
