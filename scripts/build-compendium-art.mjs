import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const root = process.cwd();

const cardSheet = {
  source: "assets/source/compendium-art/_ai-raw/imagegen-card-svg-replacements-v1.png",
  columns: 3,
  rows: 3,
  items: [
    "ink-heiyu",
    "ink-modian",
    "ink-moren",
    "mind-jingxin",
    "status-rain-chill",
    "diao-moonstep",
    "cai-yulan-echo",
    "zhuge-star-gate",
    "ink-unwritten-page"
  ].map((name) => ({
    name,
    out: `public/assets/generated/cards/imagegen-${name}-v1.png`
  }))
};

const relicSheets = [
  {
    source: "assets/source/compendium-art/_ai-raw/imagegen-relic-sheet-v1-a.png",
    items: [
      "relic_white_dragon_tassel",
      "relic_closed_moon_sachet",
      "relic_qingyu_qinhui",
      "relic_white_feather_fan",
      "relic_old_wooden_sword",
      "relic_black_paper_umbrella",
      "relic_dragon_scale_tip",
      "relic_changban_iron_seal",
      "relic_lotus_step_bell",
      "relic_half_moon_hairpin"
    ]
  },
  {
    source: "assets/source/compendium-art/_ai-raw/imagegen-relic-sheet-v1-b.png",
    items: [
      "relic_echoing_jade_chime",
      "relic_starlit_tactical_map",
      "relic_ink_washstone",
      "relic_clear_rain_charm",
      "relic_red_lacquer_token",
      "relic_silent_zither_string",
      "relic_qingyin_jade",
      "relic_broken_string",
      "relic_scribe_red_seal",
      "relic_memory_bamboo_slip"
    ]
  },
  {
    source: "assets/source/compendium-art/_ai-raw/imagegen-relic-sheet-v1-c.png",
    items: [
      "relic_cloud_dragon_scale",
      "relic_white_cloak_knot",
      "relic_moon_shadow_bell",
      "relic_silk_scheme_token",
      "relic_orchid_jade_pick",
      "relic_clear_rain_score",
      "relic_astrolabe_shard",
      "relic_bagua_copper_coin",
      "relic_jianghu_whetstone",
      "relic_traveling_cloak"
    ]
  },
  {
    source: "assets/source/compendium-art/_ai-raw/imagegen-relic-sheet-v1-d.png",
    items: [
      "relic_still_heart_lantern",
      "relic_unwritten_inkstone",
      "relic_morning_tea_cup",
      "relic_dark_ink_amulet",
      "relic_sky_piercer_coin",
      "relic_silk_step_amulet",
      "relic_peaceful_scroll",
      "relic_willow_brace",
      "relic_qin_resonance_scale",
      "relic_star_seal_bracket"
    ]
  }
].map((sheet) => ({
  ...sheet,
  columns: 5,
  rows: 2,
  items: sheet.items.map((id) => ({
    name: id,
    out: `public/assets/generated/relics/imagegen-${id}-v1.png`
  }))
}));

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(path.join(root, file)));
}

function writePng(file, png) {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, PNG.sync.write(png));
}

function cropSheet({ source, columns, rows, items }) {
  const sheet = readPng(source);
  const cellWidth = Math.floor(sheet.width / columns);
  const cellHeight = Math.floor(sheet.height / rows);
  const marginX = Math.max(6, Math.floor(cellWidth * 0.035));
  const marginY = Math.max(6, Math.floor(cellHeight * 0.035));

  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = col * cellWidth + marginX;
    const y = row * cellHeight + marginY;
    const width = Math.min(cellWidth - marginX * 2, sheet.width - x);
    const height = Math.min(cellHeight - marginY * 2, sheet.height - y);
    const out = new PNG({ width, height });
    PNG.bitblt(sheet, out, x, y, width, height, 0, 0);
    writePng(item.out, out);
  });
}

cropSheet(cardSheet);
for (const sheet of relicSheets) {
  cropSheet(sheet);
}

console.log(`Built ${cardSheet.items.length} card art crops and ${relicSheets.flatMap((sheet) => sheet.items).length} relic art crops.`);
