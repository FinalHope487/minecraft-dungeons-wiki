import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const root = new URL('../', import.meta.url);
const database = new DatabaseSync(new URL('content/catalog.sqlite', root), { readOnly: true });
const roster = JSON.parse(readFileSync(new URL('tests/fixtures/wiki-enchantment-roster.json', root), 'utf8'));
const output = new URL('docs/audits/enchantment-effect-facts.json', root);
const temporaryOutput = new URL('docs/audits/enchantment-effect-facts.json.tmp', root);

const sources = {
  enchantment: { label: 'Minecraft Wiki · Enchantment', title: 'Dungeons:Enchantment', revisionId: 3899779, timestamp: '2026-11-15', url: 'https://minecraft.wiki/w/Dungeons%3AEnchantment?oldid=3899779' },
  enchantedMobs: { label: 'Minecraft Wiki · Enchanted Mobs', title: 'Dungeons:Enchanted', revisionId: 3747433, timestamp: '2026-08-28', url: 'https://minecraft.wiki/w/Dungeons%3AEnchanted?oldid=3747433' },
  dailyTrial: { label: 'Minecraft Wiki · Daily Trial', title: 'Dungeons:Daily Trial', revisionId: 3850355, url: 'https://minecraft.wiki/w/Dungeons%3ADaily_Trial?oldid=3850355' },
  enchanterTome: { label: "Minecraft Wiki · Enchanter's Tome", title: "Dungeons:Enchanter's Tome", revisionId: 3893060, url: 'https://minecraft.wiki/w/Dungeons%3AEnchanter%27s_Tome?oldid=3893060' },
  committed: { label: 'Minecraft Wiki · Committed', title: 'Dungeons:Committed', revisionId: 3839739, url: 'https://minecraft.wiki/w/Dungeons%3ACommitted?oldid=3839739' },
  electrified: { label: 'Minecraft Wiki · Electrified', title: 'Dungeons:Electrified', revisionId: 3838102, url: 'https://minecraft.wiki/w/Dungeons%3AElectrified?oldid=3838102' },
  unusedFeatures: { label: 'Minecraft Wiki · Unused features', title: 'Dungeons:Unused features', revisionId: 3791125, url: 'https://minecraft.wiki/w/Dungeons%3AUnused_features?oldid=3791125' },
  leeching: { label: 'Minecraft Wiki · Leeching', title: 'Dungeons:Leeching', revisionId: 3839729, url: 'https://minecraft.wiki/w/Dungeons%3ALeeching?oldid=3839729' },
  sharpness: { label: 'Minecraft Wiki · Sharpness', title: 'Dungeons:Sharpness', revisionId: 3841186, url: 'https://minecraft.wiki/w/Dungeons%3ASharpness?oldid=3841186' },
  regeneration: { label: 'Minecraft Wiki · Regeneration', title: 'Dungeons:Regeneration', revisionId: 3841452, timestamp: '2026-10-14T02:48:58Z', url: 'https://minecraft.wiki/w/Dungeons%3ARegeneration?oldid=3841452' },
  withering: { label: 'Minecraft Wiki · Withering', title: 'Dungeons:Withering', revisionId: 3838180, url: 'https://minecraft.wiki/w/Dungeons%3AWithering?oldid=3838180' },
  dolphinsGrace: { label: "Minecraft Wiki · Dolphin's Grace", title: "Dungeons:Dolphin's Grace", revisionId: 3841449, url: 'https://minecraft.wiki/w/Dungeons%3ADolphin%27s_Grace?oldid=3841449' },
  shielding: { label: 'Minecraft Wiki · Shielding', title: 'Dungeons:Shielding', revisionId: 3841453, url: 'https://minecraft.wiki/w/Dungeons%3AShielding?oldid=3841453' },
  synergy: { label: 'Minecraft Wiki · Synergy', title: 'Dungeons:Synergy', revisionId: 3841454, url: 'https://minecraft.wiki/w/Dungeons%3ASynergy?oldid=3841454' },
};

const mobExcerpts = {
  accelerate: ['Ranged mobs only', 'Mob shooting speed increases for a second after hitting the hero.'],
  'bonus-shot': ['Ranged mobs only', 'Ranged mobs fires an additional shot when shooting.'],
  'chain-reaction': ['Ranged mobs only', 'Mobs projectiles splits into 5 more projectiles on impact.'],
  'critical-hit': ['Ranged mobs only', 'Mob inflicts three times as much damage when they attack.'],
  gravity: ['Ranged mobs only', 'Projectiles pull in the hero and their allies to the impact point of the arrow.'],
  growing: ['Ranged mobs only', 'Projectiles fired from the mob become larger and deal more damage the longer the projectile travel.'],
  'levitation-shot': ['Ranged mobs only', 'Projectiles cause the hero to levitate and take fall damage when hit.'],
  multishot: ['Ranged mobs only', 'Ranged mobs shoots 5 projectiles instead of 1.'],
  power: ['Ranged mobs only', 'Mob inflicts increased ranged damage.'],
  radiance: ['Ranged mobs only', 'Mob summons an aura that heals it and all allies when attacking, ranged mobs have Radiance Shot instead.'],
  'rapid-fire': ['Ranged mobs only', 'Mobs have increased shooting speed.'],
  ricochet: ['Ranged mobs only', 'Mobs’ projectile bounce from hero to hero.'],
  'tempo-theft': ['Ranged mobs only', 'Mob steals speed from heroes hit by their projectile.'],
  'void-strike': ['Ranged mobs only', 'Projectiles apply Void Touched on the hero, causing them to take more damage from further mob attacks.'],
  burning: ['Enchanted mobs', 'Mob emits a circle that continuously damages heroes within it.'],
  chilling: ['Enchanted mobs', 'Mob emits a chilling aura that slows the hero’s movement and attack speed every 2 seconds.'],
  deflect: ['Enchanted mobs', 'Mobs deflect projectiles back at the hero, dealing damage over time.'],
  'double-damage': ['Enchanted mobs', 'Mobs deal 2 times as much damage to the hero. Similar to the Strength potion.'],
  electrified: ['Enchanted mobs', 'Mob emits an electrical burst every 5 seconds, dealing major damage to nearby heroes.'],
  'fast-attack': ['Enchanted mobs', 'Mob attack speed increases.'],
  'fire-aspect': ['Enchanted mobs', 'Mob attacks burns the hero for 3 seconds.'],
  'fire-trail': ['Enchanted mobs', 'Mob leaves a trail of purple fire as it moves.'],
  freezing: ['Enchanted mobs', 'Mob slows the hero’s attack speed after hitting them.'],
  frenzied: ['Enchanted mobs', 'Mob attack speed increases by 50% when below half its maximum health.'],
  'gravity-pulse': ['Enchanted mobs', 'Mob emits a pulse that pulls in nearby heroes every 10 seconds.'],
  'heals-allies': ['Enchanted mobs', 'Mob receiving damage heals other nearby mobs.'],
  'poison-cloud': ['Enchanted mobs', 'Mob attacks create a poison cloud identical to those that witches throw wherever they land.'],
  protection: ['Enchanted mobs', 'Mob receives 50% less damage.'],
  quick: ['Enchanted mobs', 'Mobs have higher movement speed. Similar to Swiftness.'],
  regeneration: ['Enchanted mobs', 'Mobs regenerate health within seconds.'],
  rush: ['Enchanted mobs', 'Mobs gain increased movement speed for a short duration after receiving damage.'],
  thorns: ['Enchanted mobs', '12.5% of damage received applies onto the attacker.'],
  weakening: ['Enchanted mobs', 'Mob inflicts Weakened for 5 seconds, reducing the hero’s attack damage.'],
  invisible: ['Seasonal trials', 'Mob is invisible and cannot be targeted unless they are attacking or casting; exclusive to Chills and Thrills event trials.'],
  committed: ['Ancient mobs and minions', 'Mob damage to the hero increases as hero Health decreases.'],
  cowardice: ['Ancient mobs and minions', 'Mobs deal extra damage when at full health.'],
  echo: ['Ancient mobs and minions', 'Mob repeat instantaneously an attack right after attacking.'],
  'fuse-shot': ['Ancient mobs and minions', 'Mobs’ projectiles fired explode after a short duration.'],
  huge: ['Ancient mobs and minions', 'Mob appears larger.'],
  leeching: ['Ancient mobs and minions', 'Mobs gain a percent of the hero’s health every time they attack.'],
  'mob-resurrection-aura': ['Ancient mobs and minions', 'Nearby mobs, not including the enchantment bearer, are resurrected upon death.'],
  rampaging: ['Ancient mobs and minions', 'Mob attack speed increase upon attacking the hero.'],
  sharpness: ['Ancient mobs and minions', 'Mob melee damage increases.'],
  shockwave: ['Ancient mobs and minions', 'Mob projects a damaging wave after every attack in the direction of the attack.'],
  swirling: ['Ancient mobs and minions', 'Mob emits a damaging radius upon attack when hero is nearby.'],
  thundering: ['Ancient mobs and minions', 'A lightning strike targets nearby heroes after every attack.'],
  chains: ['Mystery Banner raid captains', 'Mob binds target and the target is unable to move, and binds the target to allies.'],
  ambush: ['Mystery Banner raid captains', 'Mob inflicts extra damage on unsuspecting heroes. [Verify]'],
  stunning: ['Mystery Banner raid captains', 'Mob temporarily stuns the hero when attacks and manages to kill him. [Verify]'],
  withering: ['Withering', 'Wither Skeletons and Wither Skeleton Archers apply Wither through their stone sword and red snake, respectively.'],
};

const tierCells = {
  'chain-reaction': ['10%', '20%', '30%'],
  committed: ['0–50%', '0–75%', '0–100%'],
  'critical-hit': ['10%', '15%', '20%'],
  echo: ['5 seconds', '4 seconds', '3 seconds'],
  leeching: ['5%', '7%', '9%'],
  protection: ['6%', '11%', '15%'],
  radiance: ['Melee: 20% chance', 'Radiance Shot: 50% chance'],
  thorns: ['100%', '150%', '200%'],
};

const sameRationale = {
  cowardice: '兩側都以持有者滿生命為觸發條件，提升攻擊傷害。',
  'fire-aspect': '兩側都是命中攻擊後使目標燃燒三秒。',
  gravity: '兩側都把敵人拉向武器或投射物的命中點。',
  growing: '兩側投射物都會隨飛行距離增大並提高傷害。',
  power: '兩側都提高遠程傷害。',
  'rapid-fire': '兩側都提高遠程攻擊速度。',
  weakening: '兩側都降低敵方攻擊傷害；怪物來源另明載五秒。',
};

const differentRationale = {
  accelerate: '玩家側依連續射擊逐次加速並在一秒後重置；怪物側則在命中英雄後短暫加速。',
  'critical-hit': '玩家依階級有 10%／15%／20% 機率造成三倍傷害；怪物來源稱每次攻擊都造成三倍傷害。',
  'fire-trail': '玩家側翻滾時留火四秒；怪物側移動時留紫火。',
  'gravity-pulse': '玩家側每三秒觸發；怪物側每十秒觸發。',
  leeching: '玩家側擊殺時依怪物生命上限回血；怪物側每次攻擊取得英雄生命。',
  'levitation-shot': '玩家側翻滾後下一次攻擊使目標短暫漂浮；怪物側投射物命中會使英雄漂浮並承受墜落傷害。',
  protection: '玩家側依階級減傷 6%／11%／15%；怪物側固定減傷 50%。',
  rampaging: '玩家側擊殺後有 10% 機率加速；怪物側攻擊英雄時加速。',
  shockwave: '玩家側只在連擊最後一擊觸發；怪物側每次攻擊後觸發。',
  swirling: '玩家側只在連擊最後一擊觸發；怪物側在英雄接近時攻擊觸發。',
  thorns: '玩家側反彈 100%／150%／200%；怪物側反彈 12.5%。',
  thundering: '玩家近戰攻擊有 30% 機率召雷；怪物側每次攻擊後都會召雷。',
};

const unresolvedRelationRationale = {
  'bonus-shot': '怪物側來源只記額外投射物，沒有說明第二發是否也降低傷害；不能把來源省略當成效果差異。',
  burning: '玩家來源明載每 0.5 秒造成傷害；怪物來源只說持續造成傷害，沒有給出傷害間隔，不能確認兩側效果完全相同。',
  'chain-reaction': '玩家來源列出各階級觸發機率；怪物來源只描述投射物命中後分裂，沒有說明是否每次命中都觸發。',
  chains: '玩家來源記載 30% 機率束縛一群怪物；怪物來源記載束縛英雄並連結附近盟友，但未說明怪物側觸發機率。目標不同與資訊省略不足以證明效果不同。',
  chilling: '玩家來源明載減速持續一秒；怪物來源沒有提供持續時間，不能確認兩側效果完全相同。',
  deflect: '玩家來源描述小機率反彈投射物；怪物來源描述反彈並造成持續傷害，但未證明玩家反彈不附帶持續傷害，也未提供怪物側觸發機率。',
  echo: '玩家來源列出 5／4／3 秒冷卻；怪物來源描述攻擊後重複一次，未說明怪物側沒有冷卻或觸發限制。',
  'fuse-shot': '玩家來源列出觸發頻率與命中後一秒爆炸；怪物來源只說投射物短暫延遲後爆炸，未列相同細節。',
  freezing: '來源分別記載玩家命中後使怪物減速、怪物命中後降低英雄攻擊速度；目標不同尚不足以確認底層效果關係。',
  frenzied: '兩側都在持有者生命低於一半時提高攻擊速度；怪物來源額外給出 50%，玩家來源未列相應數值，因此完整效果關係未確認。',
  multishot: '玩家來源說有機率一次射出五箭；怪物來源只說遠程怪物發射五枚而非一枚，未明載怪物側觸發機率。',
  'poison-cloud': '玩家來源明載 30% 機率與三秒持續時間；怪物來源只描述攻擊命中處生成毒雲，沒有提供相同觸發與持續細節。',
  radiance: '來源列出玩家近戰／遠程觸發機率及怪物近戰／遠程治療方式；未記載怪物側觸發機率，不能據此判為不同。',
  ricochet: '來源都記載投射物在目標間彈射，但未完整比較雙側觸發條件；目標角色不同不足以確認效果不同。',
  rush: '玩家來源明載加速一秒；怪物來源只寫短時間提高移動速度，未提供可比較的持續時間。',
  'tempo-theft': '玩家來源明載偷取速度並轉給英雄四秒；怪物來源只說投射物會從命中的英雄偷取速度，未說明轉移對象或持續時間。',
};

const reviewedSourcesForMissingMob = ['enchantment', 'enchantedMobs', 'dailyTrial'];
const partialPlayerEffects = new Set(['double-damage', 'fast-attack', 'quick']);
const legacyCompositeMobEffectIds = new Set([2198, 2255, 3056, 3064, 3072]);
const conflictEffects = new Set(['committed', 'electrified']);
function sourceRef(sourceKey, relation, excerpt, locator, note) {
  const source = sources[sourceKey];
  return {
    sourceKey,
    relation,
    revisionId: source.revisionId,
    ...(excerpt ? { excerpt } : {}),
    ...(locator ? { locator } : {}),
    ...(note ? { note } : {}),
  };
}

function supportEvidence(fact, entry) {
  if (fact.semanticKey === 'player_effect') {
    if (partialPlayerEffects.has(fact.entryId)) {
      return {
        decision: 'partial',
        confidence: 'medium',
        note: 'Enchanter’s Tome 頁與附魔總表只支持此效果可施加給其他英雄或召喚盟友，沒有完整描述英雄側機制；保留推論。',
        evidence: [
          sourceRef('enchanterTome', 'context', 'The enchanter’s tome is able to cast enchantments on up to two nearby allies which can give them various buffs such as double damage, fast attack, and quick.', 'Usage'),
          sourceRef('enchantment', 'context', 'The enchanter’s tome artifact can apply Double Damage, Fast Attack, and Quick along with two additional random enchantments onto nearby summoned mobs and other heroes.', 'Hero-accessible enchantments introduction'),
        ],
        reviewedSources: ['enchanterTome', 'enchantment'],
      };
    }
    if (fact.claimOrigin === 'source') {
      const unavailable = fact.values.en === 'Not available to heroes.';
      const section = entry.sections.join(' / ');
      const excerpt = unavailable ? section : entry.description.en;
      return {
        decision: unavailable ? 'supported_by_wiki_section' : 'supported',
        confidence: fact.wikiStatus === 'verify' ? 'low' : 'high',
        note: unavailable ? '由 Wiki 分類區段及該條目列名判定英雄不可用。' : '玩家效果依固定版附魔總表遊戲說明列核對；階級細節另外列為表格儲存格。',
        evidence: [sourceRef('enchantment', 'supports', excerpt, `${section} > ${entry.name.en}`, unavailable ? '分類文字是可用性依據。' : undefined)],
        reviewedSources: ['enchantment'],
        ...(tierCells[fact.entryId] ? { tableCells: tierCells[fact.entryId] } : {}),
      };
    }
  }

  if (fact.semanticKey === 'mob_effect') {
    if (legacyCompositeMobEffectIds.has(fact.factId)) {
      const [section, excerpt] = mobExcerpts[fact.entryId];
      return {
        decision: 'partial',
        confidence: 'medium',
        note: '保留原始複合主張與 fact ID 作為推論；怪物頁引文只支持其中的效果句，適用怪物、歷史與施加途徑應依各自欄位查證，不能把整句當成單一 Wiki 效果原文。',
        evidence: [sourceRef('enchantedMobs', 'context', excerpt, section, '此引文只支持舊複合主張中的怪物效果部分。')],
        reviewedSources: ['enchantedMobs'],
      };
    }
    if (conflictEffects.has(fact.entryId)) {
      if (fact.entryId === 'committed') {
        return {
          decision: 'conflicting_sources', confidence: 'low',
          note: '附魔怪物清單以英雄生命值為基準；Committed 條目則稱怪物側與英雄側相同，而英雄側以怪物已失生命值為基準。',
          evidence: [
            sourceRef('enchantedMobs', 'context', 'Mob damage to the hero increases as hero Health decreases.', 'Ancient mobs and minions'),
            sourceRef('committed', 'context', 'When a mob is enchanted with it, Committed functions identically to how it does for the hero.', 'Mobs'),
          ],
          reviewedSources: ['enchantedMobs', 'committed'],
        };
      }
      return {
        decision: 'conflicting_sources', confidence: 'low',
        note: '附魔怪物列表寫每五秒觸發；Electrified 歷史記錄又稱怪物觸發間隔由五秒改為四秒。',
        evidence: [
          sourceRef('enchantedMobs', 'context', 'Mob emits an electrical burst every 5 seconds, dealing major damage to nearby heroes.', 'Enchanted mobs'),
          sourceRef('electrified', 'context', 'Decreased activation delay when used by enchanted mobs from 5 seconds to 4 seconds.', 'History · 1.9.1.0'),
        ],
        reviewedSources: ['enchantedMobs', 'electrified'],
      };
    }
    if (fact.entryId === 'dolphins-grace') {
      return {
        decision: 'wiki_availability_unconfirmed', confidence: 'low',
        note: '附魔總表將怪物可用性標為待查；單品頁又標為不可取得且功能未知，沒有可核實的怪物效果。',
        evidence: [
          sourceRef('enchantment', 'context', '?', 'Dolphin’s Grace row · mob-obtainability column', '問號是 Wiki 的未確認標記。'),
          sourceRef('dolphinsGrace', 'context', null, 'Obtaining / Usage', '單品頁未提供可取得或效果的確認資料。'),
        ],
        reviewedSources: ['enchantment', 'dolphinsGrace'],
      };
    }
    if (fact.entryId === 'guarding-strike') {
      return {
        decision: 'not_found_in_reviewed_sources', confidence: 'unknown',
        note: '每日試煉頁列有此附魔的近戰怪物，但查閱頁面沒有說明怪物側效果。',
        evidence: [sourceRef('dailyTrial', 'context', null, 'Daily Trial · melee mob enchantment list', '名單只證明清單列項，不支持具體效果。')],
        reviewedSources: ['enchantment', 'enchantedMobs', 'dailyTrial'],
      };
    }
    if (fact.entryId === 'shielding') {
      return {
        decision: 'wiki_marked_unconfirmed', confidence: 'low',
        note: '附魔總表標記怪物可用性待查；Unused features 頁記載怪物曾能生成或被施加此附魔，仍保留 Wiki 的待查狀態。',
        evidence: [
          sourceRef('enchantment', 'context', '?', 'Shielding row · mob-obtainability column', '問號是 Wiki 的未確認標記。'),
          sourceRef('unusedFeatures', 'context', 'In 1.7.2.0, mobs were given the ability to spawn or be enchanted with Shielding.', 'Mob-exclusive enchantments · Shielding'),
          sourceRef('shielding', 'context', null, 'Mobs', '來源已固定至核對修訂；本 fact 記錄可用性判讀，未提取未查證的效果。'),
        ],
        reviewedSources: ['enchantment', 'unusedFeatures', 'shielding'],
      };
    }
    if (fact.entryId === 'smiting') {
      return {
        decision: 'wiki_availability_unconfirmed', confidence: 'low',
        note: '總表的怪物可用性欄在近戰與遠程表格分別標示「✖」與「?」；沒有怪物效果描述，保留未確認。',
        evidence: [sourceRef('enchantment', 'context', 'Melee: ✖; Ranged: ?', 'Smiting row · mob-obtainability column', '來源表格標記可用性，不描述效果。')],
        reviewedSources: ['enchantment', 'enchantedMobs'],
      };
    }
    if (fact.entryId === 'synergy') {
      return {
        decision: 'wiki_marked_unconfirmed', confidence: 'low',
        note: '附魔總表將怪物可用性標為待查；單品頁稱此附魔已刪除且功能未知，沒有可核實的怪物效果。',
        evidence: [
          sourceRef('enchantment', 'context', '?', 'Synergy row · mob-obtainability column', '問號是 Wiki 的未確認標記。'),
          sourceRef('synergy', 'context', null, 'Usage / Mobs', '來源已固定至核對修訂；未以條目名稱推定怪物效果。'),
        ],
        reviewedSources: ['enchantment', 'synergy'],
      };
    }
    if (fact.entryId === 'jungle-poison') {
      return {
        decision: 'unsupported_inference', confidence: 'low',
        note: '已記錄的可用怪物名單不能證明該附魔會使怪物施加中毒；來源沒有直接怪物效果描述。',
        evidence: [sourceRef('enchantment', 'context', null, 'Jungle Poison row · mob-obtainability column', '只支持名單列出可帶有附魔的怪物，不支持這項效果主張。')],
        reviewedSources: ['enchantment', 'enchantedMobs', 'dailyTrial'],
      };
    }
    if (fact.entryId === 'decal-trail') {
      return {
        decision: 'not_found_in_reviewed_sources', confidence: 'unknown',
        note: '本輪檢視的附魔總表、附魔怪物與每日試煉頁沒有找到可直接支持此怪物效果的句子。',
        evidence: [],
        reviewedSources: reviewedSourcesForMissingMob,
      };
    }
    if (fact.claimOrigin === 'source') {
      const [section, excerpt] = mobExcerpts[fact.entryId];
      const evidence = [sourceRef(fact.entryId === 'withering' ? 'withering' : 'enchantedMobs', 'supports', excerpt, section)];
      if (fact.entryId === 'regeneration') {
        evidence.push(sourceRef('regeneration', 'supports', 'Regeneration heals the health of mobs over time if they do not take damage for at least ten seconds.', 'Usage'));
      }
      return {
        decision: 'supported',
        confidence: fact.wikiStatus === 'verify' ? 'low' : 'high',
        note: fact.wikiStatus === 'verify' ? 'Wiki 直接列出此說法，但保留其 [Verify] 待查標記。' : '怪物側效果依固定版附魔怪物頁或附魔單品頁逐句核對。',
        evidence,
        reviewedSources: [...new Set(evidence.map(({ sourceKey }) => sourceKey))],
      };
    }
    if (fact.values.en.startsWith('No mob-side effect is listed')) {
      return {
        decision: 'not_found_in_reviewed_sources', confidence: 'unknown',
        note: '只表示在本輪列出的 Wiki 頁面中沒有找到效果敘述；不代表怪物不可用或效果不存在。',
        evidence: [],
        reviewedSources: reviewedSourcesForMissingMob,
      };
    }
  }

  return {
    decision: 'not_audited',
    confidence: 'unknown',
    note: '尚無逐句支持來源；保留現有主張及其來源性質，不推定效果關係。',
    evidence: [],
    reviewedSources: fact.semanticKey === 'mob_effect' ? reviewedSourcesForMissingMob : [],
  };
}

try {
  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles ORDER BY entry_id`).all();
  const factRows = database.prepare(`SELECT facts.id AS factId, facts.entry_id AS entryId,
      facts.semantic_key AS semanticKey, facts.claim_origin AS claimOrigin, facts.wiki_status AS wikiStatus,
      facts.position, translations.language, translations.label, translations.value
    FROM facts JOIN fact_translations AS translations ON translations.fact_id=facts.id
    WHERE facts.semantic_key IN ('player_effect','mob_effect')
    ORDER BY facts.entry_id,facts.position`).all();
  const factValues = new Map();
  for (const row of factRows) {
    if (!factValues.has(row.factId)) factValues.set(row.factId, {
      factId: row.factId, entryId: row.entryId, semanticKey: row.semanticKey,
      claimOrigin: row.claimOrigin, wikiStatus: row.wikiStatus, values: {},
    });
    factValues.get(row.factId).values[row.language] = row.value;
  }
  const entryById = new Map(roster.entries.map((entry) => [entry.id, entry]));
  assert.equal(roster.entries.length, 124);
  assert.equal(factValues.size, 253);
  assert.equal(profileRows.length, 124);

  const auditedFacts = [...factValues.values()].map((fact) => {
    const entry = entryById.get(fact.entryId);
    assert.ok(entry, `Fact ${fact.factId} has no Wiki roster entry`);
    const result = supportEvidence(fact, entry);
    return {
      factId: fact.factId,
      entryId: fact.entryId,
      name: entry.name,
      semanticKey: fact.semanticKey,
      claimOrigin: fact.claimOrigin,
      wikiStatus: fact.wikiStatus,
      claim: { en: fact.values.en, 'zh-Hant': fact.values['zh-Hant'] },
      decision: result.decision,
      confidence: result.confidence,
      note: result.note,
      evidence: result.evidence,
      reviewedSources: result.reviewedSources,
      ...(result.tableCells ? { tableCells: result.tableCells } : {}),
    };
  });

  const effectRelations = profileRows.map((profile) => {
    const player = factValues.get(profile.playerFactId);
    const mob = factValues.get(profile.mobFactId);
    const rationale = sameRationale[profile.entryId] || differentRationale[profile.entryId];
    let confidence = 'unknown';
    let decision = 'unconfirmed';
    let relationRationale = rationale;
    if (rationale && profile.effectRelation !== 'unknown') {
      decision = 'compared_source_descriptions';
      confidence = player.wikiStatus === 'verify' || mob.wikiStatus === 'verify' ? 'low' : 'high';
    } else if (conflictEffects.has(profile.entryId)) {
      decision = 'conflicting_sources';
      confidence = 'low';
      relationRationale = 'Wiki 來源對怪物側機制有互相矛盾的記載，不能判定玩家與怪物效果相同或不同。';
    } else if (profile.playerAvailability === 'unavailable' || profile.mobAvailability === 'unavailable') {
      decision = 'not_applicable';
      relationRationale = '一側來源明載不可用，因此不比較雙側效果；profile 保留 unknown。';
    } else if (player.claimOrigin !== 'source' || mob.claimOrigin !== 'source') {
      relationRationale = '至少一側沒有可直接支持的效果主張；不推定相同或不同。';
    } else {
      relationRationale = unresolvedRelationRationale[profile.entryId]
        || '目前固定來源未直接確認關係；保留 unknown。';
    }
    return {
      entryId: profile.entryId,
      effectRelation: profile.effectRelation,
      decision,
      confidence,
      rationale: relationRationale,
      playerFactId: profile.playerFactId,
      mobFactId: profile.mobFactId,
      evidenceFactIds: [profile.playerFactId, profile.mobFactId],
    };
  });

  const summaryBy = (items, key) => Object.fromEntries(
    [...new Set(items.map((item) => item[key]))].sort().map((value) => [value, items.filter((item) => item[key] === value).length]),
  );
  const audit = {
    auditDate: '2026-11-18',
    scope: '124 Minecraft Dungeons enchantments: player and mob effect facts, source support, Wiki status, and effect relation.',
    method: {
      confidence: 'Confidence describes the strength of the reviewed Wiki evidence for the effect claim; it is not an in-game test result.',
      absence: 'not_found_in_reviewed_sources means no direct wording was found in the listed pages. It does not mean unavailable or nonexistent.',
      verify: 'Preserve the Wiki [Verify] marker even when the sentence is directly quoted.',
      relation: 'Same/different are curator comparisons, not Wiki fields. Require explicit source evidence for material trigger, target, duration, frequency, probability, and value details; omission is not proof. Use unknown when details are insufficient, evidence is indirect, or sources conflict.',
      schema: 'SQLite remains schema v6. Exact claim provenance is in facts/fact_evidence; this file preserves the fact-level audit excerpt and relation rationale.',
    },
    sources,
    coverage: {
      enchantments: roster.entries.length,
      effectFacts: auditedFacts.length,
      factsByOrigin: summaryBy(auditedFacts, 'claimOrigin'),
      factsByDecision: summaryBy(auditedFacts, 'decision'),
      factsByConfidence: summaryBy(auditedFacts, 'confidence'),
      relationsByDecision: summaryBy(effectRelations, 'decision'),
      relationsByValue: summaryBy(effectRelations, 'effectRelation'),
      relationsByConfidence: summaryBy(effectRelations, 'confidence'),
      gameTested: false,
    },
    facts: auditedFacts,
    effectRelations,
  };

  const sourceFacts = auditedFacts.filter(({ claimOrigin }) => claimOrigin === 'source');
  assert.equal(auditedFacts.filter(({ decision }) => decision === 'not_audited').length, 0,
    'Every player/mob effect fact must have an explicit audit decision.');
  assert.ok(sourceFacts.every(({ evidence }) => evidence.some(({ relation }) => relation === 'supports')));
  for (const fact of sourceFacts) {
    for (const evidence of fact.evidence.filter(({ relation }) => relation === 'supports')) {
      const source = sources[evidence.sourceKey];
      assert.ok(source, `Unknown source key ${evidence.sourceKey}`);
      assert.equal(source.revisionId, evidence.revisionId);
    }
  }
  assert.equal(auditedFacts.find(({ entryId, semanticKey }) => entryId === 'jungle-poison' && semanticKey === 'mob_effect').claimOrigin, 'inference');
  mkdirSync(new URL('docs/audits/', root), { recursive: true });
  writeFileSync(temporaryOutput, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
  renameSync(temporaryOutput, output);
  console.log(JSON.stringify(audit.coverage, null, 2));
} finally {
  database.close();
}
