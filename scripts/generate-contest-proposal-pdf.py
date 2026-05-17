from __future__ import annotations

import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont

from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
ASSET_DIR = OUTPUT_DIR / "assets"
PUBLIC_DIR = ROOT / "public"
PAGE_SIZE = landscape(A3)

BG = (18, 18, 16)
PANEL = (31, 30, 26)
INK = (30, 29, 25)
PAPER = (238, 226, 198)
MUTED = (168, 158, 132)
GOLD = (213, 175, 93)
RED = (151, 59, 46)
TEAL = (59, 135, 128)


@dataclass
class AssetItem:
    id: str
    label: str
    path: Path
    note: str = ""


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def runtime_path(asset_path: str) -> Path:
    clean = asset_path.lstrip("/")
    if clean.startswith("assets/"):
        return PUBLIC_DIR / clean
    return ROOT / clean


def object_items(source: str) -> list[dict[str, str]]:
    blocks = re.findall(r"\{[^{}]*(?:id|assetPath|name|title)[^{}]*\}", source, re.S)
    items: list[dict[str, str]] = []
    for block in blocks:
        item: dict[str, str] = {}
        for key in ("id", "name", "title", "assetPath", "alt", "role", "chapter", "character", "rarity"):
            m = re.search(rf"{key}\s*:\s*\"([^\"]+)\"", block)
            if m:
                item[key] = m.group(1)
        if item:
            items.append(item)
    return items


def parse_content() -> dict[str, list[AssetItem]]:
    visuals = read("src/game/content/visuals.ts")
    events_ts = read("src/game/content/events.ts")
    relic_art_ts = read("src/game/content/relicArt.ts")

    event_names = {
        match.group(1): match.group(2)
        for match in re.finditer(r'id:\s*"(event_[^"]+)".*?title:\s*"([^"]+)"', events_ts, re.S)
    }
    cards: list[AssetItem] = []
    relics: list[AssetItem] = []
    events: list[AssetItem] = []
    player_portraits: list[AssetItem] = []
    enemy_portraits: list[AssetItem] = []
    battlefields: list[AssetItem] = []
    attack_sheets: list[AssetItem] = []
    vfx_assets: list[AssetItem] = []

    for o in object_items(visuals):
        asset_id = o.get("id")
        asset_path = o.get("assetPath")
        if not asset_id or not asset_path:
            continue
        path = runtime_path(asset_path)
        if not path.exists():
            continue
        if "/cards/" in asset_path:
            cards.append(AssetItem(asset_id, o.get("alt", asset_id), path))
        elif "/relics/" in asset_path:
            relics.append(AssetItem(asset_id, asset_id, path))
        elif "/events/" in asset_path:
            events.append(AssetItem(asset_id, event_names.get(asset_id, asset_id), path))
        elif "/sprites/" in asset_path:
            attack_sheets.append(AssetItem(asset_id, asset_id, path))
        elif "/vfx/" in asset_path:
            vfx_assets.append(AssetItem(asset_id, asset_id, path))
        elif "battlefield" in asset_path:
            battlefields.append(AssetItem(asset_id, asset_id, path))
        elif "standee" in asset_path:
            if asset_id in {"zhaoyun", "diaochan", "caiwenji", "zhugeliang"}:
                player_portraits.append(AssetItem(asset_id, asset_id, path))
            else:
                enemy_portraits.append(AssetItem(asset_id, asset_id, path))

    relics_sorted = []
    for rid, name, accent in re.findall(r"\[\"([^\"]+)\",\s*\"([^\"]+)\",\s*\"([^\"]+)\"\]", relic_art_ts):
        path = runtime_path(f"/assets/generated/relics/imagegen-{rid}-v1.png")
        if path.exists():
            relics_sorted.append(AssetItem(rid, name, path, accent))

    for eid, title in event_names.items():
        path = runtime_path(f"/assets/generated/events/{eid}.png")
        if path.exists():
            events.append(AssetItem(eid, title, path))

    return {
        "cards": cards,
        "relics": relics_sorted,
        "events": events,
        "player_portraits": player_portraits,
        "enemy_portraits": enemy_portraits,
        "battlefields": battlefields,
        "attack_sheets": attack_sheets,
        "vfx_assets": vfx_assets,
    }


def font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def fit_image(img: Image.Image, box: tuple[int, int], background: tuple[int, int, int] = BG) -> Image.Image:
    img = img.convert("RGBA")
    img.thumbnail(box, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", box, background + (255,))
    x = (box[0] - img.width) // 2
    y = (box[1] - img.height) // 2
    canvas.alpha_composite(img, (x, y))
    return canvas.convert("RGB")


def cover_fit(img: Image.Image, box: tuple[int, int]) -> Image.Image:
    img = img.convert("RGB")
    ratio = max(box[0] / img.width, box[1] / img.height)
    resized = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.Resampling.LANCZOS)
    x = (resized.width - box[0]) // 2
    y = (resized.height - box[1]) // 2
    return resized.crop((x, y, x + box[0], y + box[1]))


def make_contact_sheet(
    items: list[AssetItem],
    out: Path,
    title: str,
    subtitle: str,
    cols: int,
    thumb: tuple[int, int],
    max_items: int | None = None,
    mode: str = "fit",
) -> Path:
    items = items[:max_items] if max_items else items
    margin = 56
    gap = 22
    label_h = 58
    header_h = 128
    rows = math.ceil(max(1, len(items)) / cols)
    width = margin * 2 + cols * thumb[0] + (cols - 1) * gap
    height = margin * 2 + header_h + rows * (thumb[1] + label_h) + (rows - 1) * gap
    sheet = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(sheet)
    f_title = font(40)
    f_sub = font(22)
    f_label = font(18)
    draw.text((margin, margin), title, fill=PAPER, font=f_title)
    draw.text((margin, margin + 56), subtitle, fill=MUTED, font=f_sub)
    for i, item in enumerate(items):
        r, c = divmod(i, cols)
        x = margin + c * (thumb[0] + gap)
        y = margin + header_h + r * (thumb[1] + label_h + gap)
        try:
            img = Image.open(item.path)
            tile = cover_fit(img, thumb) if mode == "cover" else fit_image(img, thumb)
            sheet.paste(tile, (x, y))
        except Exception:
            draw.rectangle((x, y, x + thumb[0], y + thumb[1]), fill=(42, 35, 33))
        draw.text((x, y + thumb[1] + 10), item.label[:26], fill=(236, 232, 220), font=f_label)
        draw.text((x, y + thumb[1] + 32), item.id[:44], fill=(145, 139, 121), font=f_label)
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=92)
    return out


def chunk(items: list[AssetItem], size: int) -> Iterable[list[AssetItem]]:
    for start in range(0, len(items), size):
        yield items[start:start + size]


def sort_by_id(items: list[AssetItem], order: list[str] | None = None) -> list[AssetItem]:
    if not order:
        return sorted(items, key=lambda item: item.id)
    index = {value: i for i, value in enumerate(order)}
    return sorted(items, key=lambda item: (index.get(item.id, 10_000), item.id))


def build_contact_sheets(content: dict[str, list[AssetItem]]) -> list[tuple[str, Path]]:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    sheets: list[tuple[str, Path]] = []

    def add_group(base_name: str, title: str, subtitle: str, items: list[AssetItem], cols: int, thumb: tuple[int, int], per_page: int, mode: str = "fit") -> None:
        ordered = sort_by_id(items)
        for idx, part in enumerate(chunk(ordered, per_page), start=1):
            suffix = f"-{idx}" if len(ordered) > per_page else ""
            page_title = title if idx == 1 else f"{title}（{idx}）"
            path = ASSET_DIR / f"{base_name}{suffix}.png"
            make_contact_sheet(part, path, page_title, subtitle, cols, thumb, None, mode)
            sheets.append((page_title, path))

    add_group("cards-zhaoyun", "卡图资产 / 赵云", "已实装的赵云卡牌美术", [x for x in content["cards"] if x.id.startswith("zhao_")], 4, (250, 360), 12, "cover")
    add_group("cards-diaochan", "卡图资产 / 貂蝉", "已实装的貂蝉卡牌美术", [x for x in content["cards"] if x.id.startswith("diao_")], 4, (250, 360), 12, "cover")
    add_group("cards-caiwenji", "卡图资产 / 蔡文姬", "已实装的蔡文姬卡牌美术", [x for x in content["cards"] if x.id.startswith("cai_")], 4, (250, 360), 12, "cover")
    add_group("cards-zhugeliang", "卡图资产 / 诸葛亮", "已实装的诸葛亮卡牌美术", [x for x in content["cards"] if x.id.startswith("zhuge_")], 4, (250, 360), 12, "cover")
    add_group("cards-common", "卡图资产 / 通用与特殊", "已实装的通用、墨灾、状态与默认卡图", [x for x in content["cards"] if not x.id.startswith(("zhao_", "diao_", "cai_", "zhuge_"))], 4, (250, 360), 12, "cover")

    event_lookup = {item.id: item for item in content["events"]}
    add_group("events-luoshui", "奇遇资产 / 洛水残照", "洛水章节已实装奇遇", [event_lookup[i] for i in ["event_black_rain_ferry", "event_changban_echo", "event_palace_lantern_banquet", "event_luoshui_mirror", "event_broken_spear_shrine", "event_silk_lantern_market", "event_rain_washed_tablet", "event_fisher_old_song", "event_deserted_armory", "event_silent_bridge", "event_red_sleeve_letter", "event_black_lotus_pool", "event_river_bones_lantern", "event_mountain_pass_riddle", "event_silent_training_yard", "event_old_roadside_inn", "event_muddy_ferry_lantern"] if i in event_lookup], 3, (420, 236), 9, "cover")
    add_group("events-bamboo", "奇遇资产 / 竹林听雨", "竹林章节已实装奇遇", [event_lookup[i] for i in ["event_ruined_temple_night_qin", "event_rain_tea_pavilion", "event_bamboo_heart_question", "event_bamboo_soldier_array", "event_red_cloth_faceless", "event_broken_string_elder", "event_wordless_bamboo_scroll", "event_white_horse_lost_path", "event_red_dust_guest", "event_qingyin_lost_score", "event_bamboo_grave_song", "event_spear_oath_pavilion", "event_lotus_reflection_stage", "event_qin_rain_pavilion"] if i in event_lookup], 3, (420, 236), 9, "cover")
    add_group("events-changan", "奇遇资产 / 长安墨城", "长安章节已实装奇遇", [event_lookup[i] for i in ["event_nameless_market", "event_rewritten_history_street", "event_white_robed_stelae", "event_faceless_stage", "event_unfinished_chessboard", "event_star_board_argument", "event_ink_seller_contract", "event_broken_name_register", "event_star_board_camp"] if i in event_lookup], 3, (420, 236), 9, "cover")
    add_group("events-moyuan", "奇遇资产 / 墨渊照心", "终章章节已实装奇遇", [event_lookup[i] for i in ["event_heart_mirror", "event_unwritten_page", "event_broken_brush_altar", "event_cloud_water_dream"] if i in event_lookup], 2, (620, 348), 8, "cover")

    add_group("relics", "法宝资产总览", "已实装的法宝图标与图鉴资产", content["relics"], 5, (180, 180), 20, "fit")
    add_group("players", "角色立绘总览", "四名可选角色已实装立绘", content["player_portraits"], 4, (240, 320), 12, "fit")

    enemy_lookup = {item.id: item for item in content["enemy_portraits"]}
    add_group("enemies-luoshui", "敌人资产 / 洛水残照", "洛水章节敌人与 Boss 立绘", [enemy_lookup[i] for i in ["enemy_ink_bandit", "enemy_faceless_soldier", "enemy_paper_umbrella", "elite_sword_echo", "elite_blood_banner", "boss_ink_dongzhuo"] if i in enemy_lookup], 3, (360, 480), 6, "fit")
    add_group("enemies-bamboo", "敌人资产 / 竹林听雨", "竹林章节敌人与 Boss 立绘", [enemy_lookup[i] for i in ["enemy_bamboo_wraith", "enemy_broken_scholar", "enemy_bamboo_soldier", "elite_qin_score", "elite_bamboo_phalanx", "boss_qin_demon_echo"] if i in enemy_lookup], 3, (360, 480), 6, "fit")
    add_group("enemies-changan", "敌人资产 / 长安墨城", "长安章节敌人与 Boss 立绘", [enemy_lookup[i] for i in ["enemy_ink_market_guard", "enemy_history_scribe", "enemy_nameless_citizen", "elite_lubu_shadow", "elite_memory_stela", "boss_scribe_officer"] if i in enemy_lookup], 3, (360, 480), 6, "fit")
    add_group("enemies-moyuan", "敌人资产 / 墨渊照心", "终章 Boss 立绘", [enemy_lookup[i] for i in ["boss_nameless_historian"] if i in enemy_lookup], 1, (1160, 620), 4, "fit")

    add_group("battlefields", "战斗场景总览", "四章战斗背景与场景资产", content["battlefields"], 2, (780, 440), 4, "cover")
    add_group("attacks", "战斗动作条总览", "角色与敌人的攻击动画序列帧", content["attack_sheets"], 2, (760, 190), 8, "fit")
    add_group("vfx", "战斗特效总览", "签名攻击与视觉特效资产", content["vfx_assets"], 4, (320, 220), 8, "fit")

    return sheets


def register_fonts() -> str:
    for name, path in [
        ("CN", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
        ("CN", "/System/Library/Fonts/Hiragino Sans GB.ttc"),
        ("CN", "/System/Library/Fonts/STHeiti Medium.ttc"),
    ]:
        if Path(path).exists():
            try:
                pdfmetrics.registerFont(TTFont(name, path))
                return name
            except Exception:
                continue
    return "Helvetica"


class PdfBuilder:
    def __init__(self, out: Path, sheets: list[tuple[str, Path]], content: dict[str, list[AssetItem]]):
        self.out = out
        self.sheets = sheets
        self.content = content
        self.font = register_fonts()
        self.c = Canvas(str(out), pagesize=PAGE_SIZE)
        self.w, self.h = PAGE_SIZE
        self.page = 0

    def new_page(self, title: str | None = None):
        if self.page:
            self.c.showPage()
        self.page += 1
        self.c.setFillColor(colors.HexColor("#141310"))
        self.c.rect(0, 0, self.w, self.h, fill=1, stroke=0)
        self.c.setFillColor(colors.HexColor("#2a261f"))
        self.c.rect(0, self.h - 18 * mm, self.w, 18 * mm, fill=1, stroke=0)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.setFont(self.font, 9)
        self.c.drawString(15 * mm, self.h - 11 * mm, "Inkblade: Tales of Jianghu / AI 产品设计大赛策划案")
        self.c.drawRightString(self.w - 15 * mm, self.h - 11 * mm, f"{self.page:02d}")
        if title:
            self.c.setFont(self.font, 23)
            self.c.setFillColor(colors.HexColor("#efe2c3"))
            self.c.drawString(15 * mm, self.h - 31 * mm, title)

    def p(self, text: str, x: float, y: float, width: float, size: int = 10, color: str = "#e9dfc5", leading: int | None = None) -> float:
        style = ParagraphStyle(
            "body",
            fontName=self.font,
            fontSize=size,
            leading=leading or int(size * 1.55),
            textColor=colors.HexColor(color),
            spaceAfter=4,
        )
        para = Paragraph(text.replace("\n", "<br/>"), style)
        _, h = para.wrap(width, 260 * mm)
        para.drawOn(self.c, x, y - h)
        return y - h

    def pill(self, text: str, x: float, y: float, color: str = "#973b2e"):
        self.c.setFillColor(colors.HexColor(color))
        self.c.roundRect(x, y - 6 * mm, 37 * mm, 8 * mm, 4 * mm, fill=1, stroke=0)
        self.c.setFillColor(colors.white)
        self.c.setFont(self.font, 8)
        self.c.drawCentredString(x + 18.5 * mm, y - 3.8 * mm, text)

    def image(self, path: Path, x: float, y: float, w: float, h: float):
        self.c.drawImage(str(path), x, y, w, h, preserveAspectRatio=True, anchor="c", mask="auto")

    def image_page(self, title: str, path: Path, caption: str = ""):
        self.new_page(title)
        pad_x = 10 * mm
        pad_top = 18 * mm
        pad_bottom = 14 * mm
        self.c.setFillColor(colors.HexColor("#1a1815"))
        self.c.roundRect(pad_x, pad_bottom, self.w - 2 * pad_x, self.h - pad_top - pad_bottom, 4 * mm, fill=1, stroke=0)
        self.c.drawImage(str(path), pad_x + 4 * mm, pad_bottom + 4 * mm, self.w - 2 * pad_x - 8 * mm, self.h - pad_top - pad_bottom - 8 * mm, preserveAspectRatio=True, anchor="c", mask="auto")
        if caption:
            self.c.setFillColor(colors.HexColor("#c8b790"))
            self.c.setFont(self.font, 9)
            self.c.drawString(12 * mm, 8 * mm, caption)

    def section_box(self, x: float, y: float, w: float, h: float, title: str, body: str, accent: str = "#3b8780"):
        self.c.setFillColor(colors.HexColor("#1f1e1a"))
        self.c.roundRect(x, y - h, w, h, 4 * mm, fill=1, stroke=0)
        self.c.setFillColor(colors.HexColor(accent))
        self.c.rect(x, y - h, 2.2 * mm, h, fill=1, stroke=0)
        self.c.setFont(self.font, 13)
        self.c.setFillColor(colors.HexColor("#efe2c3"))
        self.c.drawString(x + 7 * mm, y - 10 * mm, title)
        self.p(body, x + 7 * mm, y - 15 * mm, w - 12 * mm, 8.8, "#d8d0ba", 13)

    def build(self):
        self.cover()
        self.overview()
        self.content_systems()
        for title, path in self.sheets:
            self.image_page(title, path, "视觉接触图均来自仓库中已实装并绑定到运行时的数据与资产。")
        self.tech_ai()
        self.scenarios()
        self.c.save()

    def cover(self):
        self.new_page(None)
        cover = ROOT / "docs/assets/ai-cover.png"
        if cover.exists():
            self.c.drawImage(str(cover), 0, 0, self.w, self.h, preserveAspectRatio=False, mask="auto")
            self.c.setFillColor(colors.Color(0, 0, 0, alpha=0.45))
            self.c.rect(0, 0, self.w, self.h, fill=1, stroke=0)
        self.c.setFillColor(colors.HexColor("#efe2c3"))
        self.c.setFont(self.font, 34)
        self.c.drawString(18 * mm, 93 * mm, "云水江湖")
        self.c.setFont(self.font, 16)
        self.c.drawString(18 * mm, 82 * mm, "Inkblade: Tales of Jianghu")
        self.c.setFont(self.font, 11)
        self.c.drawString(18 * mm, 72 * mm, "AI 产品设计大赛策划案 / 水墨国风武侠卡牌构筑 Roguelike")
        self.p("一个由 AI 全流程协同完成的可玩游戏纵切片：GPT-5.5 负责游戏逻辑与服务端，Gemini 3.1 负责客户端，gpt image 2 生成美术资产，Codex 与 Gemini CLI 负责工程执行，并以 TDD / SDD 组织开发闭环。", 18 * mm, 57 * mm, 172 * mm, 10.5, "#efe2c3", 16)

    def overview(self):
        self.new_page("一、作品创意与定位")
        y = self.h - 43 * mm
        y = self.p("《云水江湖》是一款水墨国风武侠卡牌构筑 Roguelike。玩家操控赵云、貂蝉、蔡文姬、诸葛亮等乱世人物，在被“墨灾”侵蚀的云水江湖中，通过卡牌招式、心境变化、法宝心法和路线选择构筑自己的武学流派，最终面对心魔与改写命运的抉择。", 15 * mm, y, 180 * mm, 10.5)
        self.section_box(15 * mm, y - 7 * mm, 84 * mm, 52 * mm, "核心创意", "把卡牌战斗翻译成武侠动作与精神修行：牌是招式，遗物是法宝，状态是心境，地图是江湖行旅。玩家不是机械打牌，而是在一局局选择中决定自己如何面对执念。", "#973b2e")
        self.section_box(111 * mm, y - 7 * mm, 84 * mm, 52 * mm, "文化表达", "世界观来自 docs 中“人心可化作武学，执念可化作妖魔”的设定。墨灾既是灾厄，也是历史误读、亡魂记忆与未竟心愿的具象化。", "#3b8780")
        y -= 72 * mm
        self.c.setFont(self.font, 15)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.drawString(15 * mm, y, "产品卖点")
        bullets = ["水墨国风美术：宣纸、水墨、朱砂、青绿山水形成差异化视觉。", "武侠卡牌战斗：每张牌都是武学、琴音、阵法或江湖手段。", "四角色差异化：枪势、舞势、音律、筹策构成不同构筑逻辑。", "心境与墨灾：宁、怒、悲、魅、乱、悟影响战斗、事件和结局。", "路线与多结局：普通战、精英、奇遇、商店、休息、Boss 组成单局探索。"]
        y -= 9 * mm
        for b in bullets:
            y = self.p("• " + b, 20 * mm, y, 165 * mm, 9.5, "#e5dbc1", 14) - 1.5 * mm

    def content_systems(self):
        self.new_page("二、功能与玩法系统")
        self.section_box(15 * mm, self.h - 43 * mm, 180 * mm, 38 * mm, "当前可玩完成度", "已实现 4 名角色、4 个章节、150+ 张卡牌、40+ 法宝、45 个奇遇事件、19 个敌人、战斗/地图/事件/商店/休息/奖励/图鉴/存档/结算等闭环界面。桌面横屏浏览器原型已经可运行演示。", "#d6af5d")
        y = self.h - 92 * mm
        data = [
            ("赵云", "枪势 / 护主 / 破阵 / 白龙枪法"),
            ("貂蝉", "舞势 / 魅惑 / 闪避 / 离间红绫"),
            ("蔡文姬", "音律 / 余韵 / 净化 / 终曲治疗"),
            ("诸葛亮", "筹策 / 观星 / 阵法 / 借风推演"),
        ]
        for i, (name, desc) in enumerate(data):
            x = 15 * mm + (i % 2) * 92 * mm
            yy = y - (i // 2) * 32 * mm
            self.section_box(x, yy, 84 * mm, 24 * mm, name, desc, "#3b8780" if i % 2 == 0 else "#973b2e")
        self.c.setFont(self.font, 15)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.drawString(15 * mm, 80 * mm, "单局循环")
        cycle = "选择角色 -> 进入章节地图 -> 选择路线节点 -> 战斗/奇遇/商店/休息 -> 获得卡牌、法宝、心法或代价 -> 优化构筑 -> 击败章节 Boss -> 进入墨渊与心魔终局。"
        self.p(cycle, 15 * mm, 71 * mm, 180 * mm, 10, "#e9dfc5", 15)
        self.c.setFont(self.font, 15)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.drawString(15 * mm, 48 * mm, "章节结构")
        self.p("洛水残照关注权力与被书写的命运；竹林听雨关注记忆、悲伤与放下；长安墨城关注历史、名声与改命；墨渊照心进入心魔审判与多结局分流。", 15 * mm, 39 * mm, 180 * mm, 9.7, "#e9dfc5", 14)

    def tech_ai(self):
        self.new_page("三、技术实现与 AI 协作")
        boxes = [
            ("技术栈", "TypeScript + Phaser 3 + Vite；DOM Overlay 承载卡牌、地图、商店、事件、奖励与图鉴；Vitest / Playwright 负责单元测试和浏览器验证。", "#3b8780"),
            ("架构原则", "战斗、卡牌、事件、法宝、结局等规则放在纯 TypeScript 系统层；Phaser 与 DOM 只负责表现适配，便于测试、复盘和数值仿真。", "#d6af5d"),
            ("SDD", "先由规格文档定义玩法边界、角色机制、章节叙事、资产需求和验收标准，再让 AI 按规格拆分实现。", "#973b2e"),
            ("TDD", "卡牌效果、战斗流程、事件收益、法宝触发等规则先写测试，再迭代实现，减少 AI 生成代码的不确定性。", "#3b8780"),
        ]
        for i, (t, b, a) in enumerate(boxes):
            x = 15 * mm + (i % 2) * 92 * mm
            y = self.h - 43 * mm - (i // 2) * 57 * mm
            self.section_box(x, y, 84 * mm, 44 * mm, t, b, a)
        self.c.setFont(self.font, 16)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.drawString(15 * mm, 93 * mm, "AI 工具链分工")
        rows = [
            ("GPT-5.5", "游戏逻辑、服务端、数值规则、测试与重构"),
            ("Gemini 3.1", "客户端界面、交互组织、浏览器表现"),
            ("gpt image 2", "角色、敌人、事件、卡牌、法宝、UI 与封面资产"),
            ("Codex / Gemini CLI", "工程执行、联调、自动化测试、资产接入"),
        ]
        y = 80 * mm
        for tool, task in rows:
            self.pill(tool, 18 * mm, y + 1 * mm, "#973b2e")
            self.p(task, 61 * mm, y + 1 * mm, 128 * mm, 9.5, "#e9dfc5", 13)
            y -= 14 * mm
        self.p("项目价值不在于“用了 AI”，而在于用规格、测试、资产绑定和视觉验收，把 AI 变成可控、可复盘、可持续迭代的产品生产力。", 15 * mm, 26 * mm, 180 * mm, 10.5, "#efe2c3", 16)

    def scenarios(self):
        self.new_page("四、应用场景与参赛总结")
        self.section_box(15 * mm, self.h - 43 * mm, 180 * mm, 40 * mm, "大赛展示价值", "本项目能展示 AI 对复杂游戏产品的全链路生产能力：玩法设计、叙事体系、代码工程、美术资产、测试验证和最终可运行原型。它不是单张概念图，而是可演示的产品纵切片。", "#d6af5d")
        scenarios = [
            ("AI 产品设计大赛", "展示复杂交互产品如何由多模型协同完成，并体现团队对 AI 工具链的驾驭。"),
            ("Steam / 独立游戏 Demo", "继续扩展角色剧情、法宝池和关卡节奏，可向公开试玩或抢先体验推进。"),
            ("国风文化数字化", "用武侠、三国、水墨和交互策略包装传统文化表达。"),
            ("AI 开发方法案例", "可作为 SDD + TDD + 视觉验收的 AI 编程实践样本。"),
        ]
        y = self.h - 95 * mm
        for i, (t, b) in enumerate(scenarios):
            self.section_box(15 * mm + (i % 2) * 92 * mm, y - (i // 2) * 45 * mm, 84 * mm, 34 * mm, t, b, "#3b8780" if i % 2 == 0 else "#973b2e")
        self.c.setFont(self.font, 17)
        self.c.setFillColor(colors.HexColor("#d6af5d"))
        self.c.drawString(15 * mm, 62 * mm, "总结")
        self.p("《云水江湖》证明了 AI 不只适合生成孤立素材，也能够参与真实产品的创意、工程、内容、资产和验证闭环。项目已经具备可玩系统、可视化资产、章节叙事和测试基础，适合作为 AI 产品设计大赛中“从概念到原型”的完整案例。", 15 * mm, 51 * mm, 180 * mm, 11, "#efe2c3", 17)
        self.p("参考资料：docs/yunshui_game_prd_v1.md、docs/云水江湖_世界观与背景故事设定文档_v0.3.md、docs/云水江湖_游戏核心玩法机制文档_v1.0.md、docs/chapters/*.md、docs/art/*.md，以及 src/game/content 下的实际运行时绑定数据。", 15 * mm, 24 * mm, 180 * mm, 8.5, "#b8ad91", 12)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    content = parse_content()
    sheets = build_contact_sheets(content)
    pdf_path = OUTPUT_DIR / "云水江湖_AI产品设计大赛策划案.pdf"
    PdfBuilder(pdf_path, sheets, content).build()
    print(pdf_path)
    for k, v in sheets:
        print(k, v)


if __name__ == "__main__":
    main()
