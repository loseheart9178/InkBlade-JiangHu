export interface RelicArtDefinition {
  id: string;
  assetPath: string;
  alt: string;
  accent: "red" | "teal" | "ink" | "gold";
}

const relicArtEntries: Array<[string, string, RelicArtDefinition["accent"]]> = [
  ["relic_white_dragon_tassel", "白龙枪缨", "teal"],
  ["relic_closed_moon_sachet", "闭月香囊", "red"],
  ["relic_qingyu_qinhui", "青玉琴徽", "teal"],
  ["relic_white_feather_fan", "白羽扇", "gold"],
  ["relic_old_wooden_sword", "旧木剑", "red"],
  ["relic_black_paper_umbrella", "黑纸伞", "ink"],
  ["relic_dragon_scale_tip", "鳞锋枪尖", "red"],
  ["relic_changban_iron_seal", "长坂铁印", "gold"],
  ["relic_lotus_step_bell", "莲步铃", "teal"],
  ["relic_half_moon_hairpin", "半月钗", "red"],
  ["relic_echoing_jade_chime", "回音玉磬", "teal"],
  ["relic_starlit_tactical_map", "星照阵图", "gold"],
  ["relic_ink_washstone", "洗墨石", "ink"],
  ["relic_clear_rain_charm", "清雨符", "teal"],
  ["relic_red_lacquer_token", "朱漆令", "red"],
  ["relic_silent_zither_string", "无声琴弦", "teal"],
  ["relic_qingyin_jade", "清音玉", "teal"],
  ["relic_broken_string", "断弦", "ink"],
  ["relic_scribe_red_seal", "朱批印", "red"],
  ["relic_memory_bamboo_slip", "记忆竹简", "gold"],
  ["relic_cloud_dragon_scale", "云龙鳞", "teal"],
  ["relic_white_cloak_knot", "白袍结", "teal"],
  ["relic_moon_shadow_bell", "月影铃", "teal"],
  ["relic_silk_scheme_token", "绫计牌", "red"],
  ["relic_orchid_jade_pick", "兰玉拨", "teal"],
  ["relic_clear_rain_score", "清雨谱", "teal"],
  ["relic_astrolabe_shard", "星盘残片", "gold"],
  ["relic_bagua_copper_coin", "八卦铜钱", "gold"],
  ["relic_jianghu_whetstone", "江湖砥石", "red"],
  ["relic_traveling_cloak", "行脚斗篷", "teal"],
  ["relic_still_heart_lantern", "止水灯", "teal"],
  ["relic_unwritten_inkstone", "未写砚", "ink"],
  ["relic_morning_tea_cup", "晨茶盏", "gold"],
  ["relic_dark_ink_amulet", "墨影符", "ink"],
  ["relic_sky_piercer_coin", "穿云钱", "gold"],
  ["relic_silk_step_amulet", "绫步佩", "teal"],
  ["relic_peaceful_scroll", "静心卷", "teal"],
  ["relic_willow_brace", "垂柳腕", "teal"],
  ["relic_qin_resonance_scale", "琴应鳞", "teal"],
  ["relic_star_seal_bracket", "星封箍", "gold"]
];

export const relicArtList: RelicArtDefinition[] = relicArtEntries.map(([id, name, accent]) => ({
  id,
  assetPath: `/assets/generated/relics/imagegen-${id}-v1.png`,
  alt: `${name}法宝水墨美术`,
  accent
}));

export const relicArtById: Record<string, RelicArtDefinition> = Object.fromEntries(
  relicArtList.map((art) => [art.id, art])
);
