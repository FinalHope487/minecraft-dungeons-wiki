import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

const root = new URL('../', import.meta.url);
const database = new DatabaseSync(new URL('content/catalog.sqlite', root), { readOnly: true });
const roster = JSON.parse(readFileSync(new URL('tests/fixtures/wiki-enchantment-roster.json', root), 'utf8'));
const audit = JSON.parse(readFileSync(new URL('docs/audits/enchantment-effect-facts.json', root), 'utf8'));
const progress = JSON.parse(readFileSync(new URL('docs/audits/enchantment-effect-rewrite-progress.json', root), 'utf8'));
const expectedEntryIds = [
  'accelerate', 'acrobat', 'ambush', 'anima-conduit', 'artifact-charge', 'artifact-synergy',
  'bag-of-souls', 'barrier', 'beast-boss', 'beast-burst', 'beast-surge', 'bonus-shot',
];

function translationsForFact(factId) {
  return Object.fromEntries(database.prepare(`SELECT language, value FROM fact_translations WHERE fact_id=? ORDER BY language`)
    .all(factId).map(({ language, value }) => [language, value]));
}

test('first enchantment rewrite batch preserves source evidence and changes only reviewed claims', () => {
  const batch = progress.batches.find(({ batch }) => batch === 1);
  assert.ok(batch, 'Missing first-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 24);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2358, 2360, 2376]);
  assert.ok(batch.facts.every(({ old, next }) => old.en && old['zh-Hant'] && next.en && next['zh-Hant']));
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 3);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });

  assert.equal(roster.entries.find(({ id }) => id === 'accelerate').description.en,
    translationsForFact(2358).en, 'Accelerate must use the original in-game description');
  assert.equal(translationsForFact(2360).en, 'After hitting a hero, a ranged mob\'s firing speed increases for one second.');
  assert.equal(translationsForFact(2376).en, 'Ranged mobs fire an additional projectile when they shoot.');
  assert.equal(auditByFactId.get(2086).wikiStatus, 'verify', 'Ambush must retain the Wiki verify marker');
  assert.equal(translationsForFact(2974).en, 'Not available to heroes.', 'Barrier remains unavailable to players');
});

test('second enchantment rewrite batch preserves original wording, tier values, and evidence', () => {
  const batch = progress.batches.find(({ batch }) => batch === 2);
  const expectedEntryIds = [
    'bows-boon', 'burning', 'burst-bowstring', 'busy-bee', 'chain-reaction', 'chains',
    'chilling', 'committed', 'cool-down', 'cooldown-shot', 'cowardice', 'critical-hit',
  ];
  assert.ok(batch, 'Missing second-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 24);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2118, 2124, 2309, 2311, 2502]);
  assert.equal(changed.length, 5);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 5);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const description = (id) => roster.entries.find(({ id: entryId }) => entryId === id).description;
  const chainDescription = description('chain-reaction');
  const committedDescription = description('committed');
  const criticalDescription = description('critical-hit');
  assert.ok(translationsForFact(2502).en.startsWith(`${chainDescription.en.slice(0, -1)}; tiers I / II / III`));
  assert.ok(translationsForFact(2124).en.startsWith(`${committedDescription.en.slice(0, -1)}; tiers I / II / III`));
  assert.ok(translationsForFact(2309).en.startsWith(`${criticalDescription.en.slice(0, -1)}; tiers I / II / III`));
  assert.match(translationsForFact(2502).en, /10% \/ 20% \/ 30%/);
  assert.match(translationsForFact(2124).en, /0–50% \/ 0–75% \/ 0–100%/);
  assert.match(translationsForFact(2309).en, /10% \/ 15% \/ 20%/);
  assert.match(translationsForFact(2118).en, /preventing movement/);
  assert.equal(translationsForFact(2126).en,
    'The enchanted-mob list says damage rises as the hero’s health falls; the Committed article says the mob version works identically to the hero version. Wiki pages conflict, so the mob-side trigger is unconfirmed.');
  assert.equal(translationsForFact(2311).en, 'When a mob attacks, it deals three times its normal damage.');
});

test('third enchantment rewrite batch records every effect fact and changes only Echo player wording', () => {
  const batch = progress.batches.find(({ batch }) => batch === 3);
  const expectedEntryIds = [
    'death-barter', 'decal-trail', 'deflect', 'dipping-poison', 'dolphins-grace', 'double-damage',
    'dynamo', 'echo', 'electrified', 'emerald-shield', 'enigma-resonator', 'environmental-protection',
  ];
  assert.ok(batch, 'Missing third-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 25);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId), [2140]);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 1);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const echo = roster.entries.find(({ id }) => id === 'echo');
  assert.ok(translationsForFact(2140).en.startsWith(`${echo.description.en.slice(0, -1)}; tiers I / II / III`));
  assert.match(translationsForFact(2140).en, /cooldowns of 5 \/ 4 \/ 3 seconds, respectively/);
  assert.deepEqual(echo.availability.playerEffect, [translationsForFact(2140).en, translationsForFact(2140)['zh-Hant']]);
  assert.equal(translationsForFact(2142).en, 'The mob repeats an attack immediately after attacking.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('echo').effect_relation, 'unknown');

  const doubleDamageIds = batch.facts.filter(({ entryId }) => entryId === 'double-damage').map(({ factId }) => factId);
  assert.deepEqual(doubleDamageIds, [3054, 3056, 3076]);
  assert.equal(database.prepare('SELECT mob_fact_id FROM enchantment_effect_profiles WHERE entry_id=?').get('double-damage').mob_fact_id, 3076);
  assert.equal(batch.facts.find(({ factId }) => factId === 3056).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3032).disposition, 'unknown_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3030).disposition, 'unavailable_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 2982).disposition, 'unavailable_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 2984).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 2616).disposition, 'inference_retained');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('fourth enchantment rewrite batch restores full game descriptions and preserves special cases', () => {
  const batch = progress.batches.find(({ batch }) => batch === 4);
  const expectedEntryIds = [
    'exploding', 'explorer', 'fast-attack', 'final-shout', 'fire-aspect', 'fire-focus',
    'fire-trail', 'food-reserves', 'freezing', 'frenzied', 'fuse-shot', 'gravity',
  ];
  assert.ok(batch, 'Missing fourth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 25);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId), [2156, 2172]);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 2);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const entry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  for (const [id, factId] of [['fire-aspect', 2156], ['gravity', 2172]]) {
    const source = entry(id);
    const translated = translationsForFact(factId);
    const playerEffect = source.facts.find(({ label }) => label.en === 'Player effect');
    assert.deepEqual(translated, source.description);
    assert.deepEqual(playerEffect.value, translated);
    assert.deepEqual(source.availability.playerEffect, [translated.en, translated['zh-Hant']]);
  }

  assert.equal(translationsForFact(2156).en, 'Sets mobs on fire for three seconds, dealing damage over time.');
  assert.equal(translationsForFact(2158).en, 'Mob attacks burn the hero for three seconds.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('fire-aspect').effect_relation, 'same');
  assert.equal(translationsForFact(2172).en, "This effect pulls mobs in range toward's the weapon's impact point.");
  assert.equal(translationsForFact(2174).en, 'Ranged mob projectiles pull the hero and nearby allies toward the impact point.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('gravity').effect_relation, 'same');

  assert.equal(translationsForFact(3062).en.includes('increased attack speed'), true);
  assert.equal(batch.facts.find(({ factId }) => factId === 3062).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3064).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3077).disposition, 'source_verified_unchanged');
  assert.equal(database.prepare('SELECT mob_fact_id FROM enchantment_effect_profiles WHERE entry_id=?').get('fast-attack').mob_fact_id, 3077);
  assert.equal(translationsForFact(2648).en, 'Below half health, the mob’s attack speed increases by 50%.');
  assert.equal(translationsForFact(2646).en.includes('50%'), false);
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('fire-trail').effect_relation, 'different');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('freezing').effect_relation, 'unknown');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('fuse-shot').effect_relation, 'unknown');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('fifth enchantment rewrite batch restores supported wording and preserves availability and inference', () => {
  const batch = progress.batches.find(({ batch }) => batch === 5);
  const expectedEntryIds = [
    'gravity-pulse', 'growing', 'guarding-strike', 'heals-allies', 'health-synergy', 'huge',
    'illagers-bane', 'infinity', 'invisible', 'jungle-poison', 'knockback', 'leeching',
  ];
  assert.ok(batch, 'Missing fifth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 25);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2196, 2822, 3024]);
  assert.equal(changed.length, 3);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 3);
  assert.deepEqual(batch.facts.map(({ factId }) => factId).sort((a, b) => a - b), [
    2180, 2182, 2188, 2190, 2196, 2198, 2414, 2416, 2422, 2424, 2654, 2656, 2822,
    2824, 2870, 2872, 2950, 2952, 2990, 2992, 3022, 3024, 3038, 3040, 3074,
  ]);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const entry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  const gravityPulse = entry('gravity-pulse');
  const invisible = entry('invisible');
  const leeching = entry('leeching');
  const factValue = (item, label) => item.facts.find(({ label: itemLabel }) => itemLabel.en === label).value;

  assert.equal(translationsForFact(2822).en, 'A blast occurs every three seconds that pulls nearby enemies towards you.');
  assert.equal(translationsForFact(2822)['zh-Hant'], '每 3 秒產生一次爆發，將附近敵人拉向你。');
  assert.deepEqual(factValue(gravityPulse, 'Player effect'), translationsForFact(2822));
  assert.deepEqual(gravityPulse.availability.playerEffect, [translationsForFact(2822).en, translationsForFact(2822)['zh-Hant']]);
  assert.equal(gravityPulse.description.en, 'A blast occurs every three seconds that pulls nearby enemies towards you.');
  assert.equal(translationsForFact(2824).en, 'The mob emits a pulse every ten seconds that pulls nearby heroes toward it.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('gravity-pulse').effect_relation, 'different');

  assert.equal(translationsForFact(3024).en, 'In the Chills and Thrills event trials, enchanted mobs are invisible and cannot be targeted unless they are attacking or casting.');
  assert.deepEqual(factValue(invisible, 'Mob effect'), translationsForFact(3024));
  assert.deepEqual(invisible.availability.mobEffect, [translationsForFact(3024).en, translationsForFact(3024)['zh-Hant']]);
  assert.equal(invisible.description.en, 'Makes the mob invisible and invincible unless it is attacking or casting.');
  assert.equal(invisible.availability.audience, 'mob');
  assert.equal(invisible.availability.hero[0], 'Unavailable to heroes');

  assert.equal(translationsForFact(2196).en,
    "Defeating a mob heals you a small portion of the mob's max health; tiers I / II / III heal you for 5% / 7% / 9% of that mob's maximum health, respectively.");
  assert.deepEqual(factValue(leeching, 'Player effect'), translationsForFact(2196));
  assert.deepEqual(leeching.availability.playerEffect, [translationsForFact(2196).en, translationsForFact(2196)['zh-Hant']]);
  assert.equal(leeching.description.en, "Defeating a mob heals you a small portion of the mob's max health.");
  assert.equal(translationsForFact(2198).en, 'Ancient mobs gain a portion of the hero’s health whenever they attack; the Wiki history also mentions Mystery Banner mobs.');
  assert.equal(batch.facts.find(({ factId }) => factId === 2198).disposition, 'inference_retained');
  assert.equal(translationsForFact(3074).en, 'Mobs gain a percent of the hero’s health every time they attack.');
  assert.equal(database.prepare('SELECT mob_fact_id FROM enchantment_effect_profiles WHERE entry_id=?').get('leeching').mob_fact_id, 3074);
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('leeching').effect_relation, 'different');

  assert.equal(batch.facts.find(({ factId }) => factId === 2182).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 2872).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3040).next.en,
    'Ancient mobs and minions with this enchantment appear larger.');
  assert.equal(translationsForFact(2990).en, 'Not available to heroes.');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('sixth enchantment rewrite batch records multishot tier values and preserves the other 23 facts', () => {
  const batch = progress.batches.find(({ batch }) => batch === 6);
  const expectedEntryIds = [
    'levitation-shot', 'life-boost', 'lightning-focus', 'looting', 'luck-of-the-sea', 'lucky-explorer',
    'mob-resurrection-aura', 'multi-roll', 'multishot', 'overcharge', 'pain-cycle', 'piercing',
  ];
  assert.ok(batch, 'Missing sixth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 24);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId), [2430]);
  assert.equal(changed.length, 1);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 1);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const multishot = roster.entries.find(({ id }) => id === 'multishot');
  const playerEffect = multishot.facts.find(({ label }) => label.en === 'Player effect');
  assert.deepEqual(multishot.description, {
    en: 'Grants the chance to fire five arrows at once.',
    'zh-Hant': '有機率一次射出五支箭。',
  });
  assert.equal(translationsForFact(2430).en,
    'Grants the chance to fire five arrows at once; tiers I / II / III have a 20% / 30% / 40% chance to trigger, respectively.');
  assert.equal(translationsForFact(2430)['zh-Hant'], '有機率一次射出五支箭；I／II／III 階的觸發機率分別為 20%／30%／40%。');
  assert.deepEqual(playerEffect.value, translationsForFact(2430));
  assert.deepEqual(multishot.availability.playerEffect, [translationsForFact(2430).en, translationsForFact(2430)['zh-Hant']]);
  assert.deepEqual(auditByFactId.get(2430).tableCells, ['20%', '30%', '40%']);
  assert.equal(translationsForFact(2432).en, 'Ranged mobs fire five projectiles instead of one.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('multishot').effect_relation, 'unknown');
  const pendingRelation = batch.pendingFindings.find(({ entryId, field }) => entryId === 'multishot' && field === 'effectRelation');
  assert.equal(pendingRelation.currentValue, 'unknown');
  assert.equal(pendingRelation.candidateValue, 'different');
  assert.equal(pendingRelation.status, 'awaiting_pinned_revision_confirmation');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('seventh enchantment rewrite batch restores supported wording and preserves source distinctions', () => {
  const batch = progress.batches.find(({ batch }) => batch === 7);
  const expectedEntryIds = [
    'poison-cloud', 'poison-focus', 'potion-barrier', 'power', 'prospector', 'protection',
    'punch', 'quick', 'radiance', 'rampaging', 'rapid-fire', 'reckless',
  ];
  assert.ok(batch, 'Missing seventh-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 25);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2222, 2237, 2854]);
  assert.equal(batch.facts.filter(({ old, next }) => old.en !== next.en || old['zh-Hant'] !== next['zh-Hant']).length, 3);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const entry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  const factValue = (item, label) => item.facts.find(({ label: factLabel }) => factLabel.en === label).value;
  const poisonCloud = entry('poison-cloud');
  const protection = entry('protection');
  const radiance = entry('radiance');
  assert.deepEqual(factValue(poisonCloud, 'Mob effect'), translationsForFact(2222));
  assert.deepEqual(poisonCloud.availability.mobEffect, [translationsForFact(2222).en, translationsForFact(2222)['zh-Hant']]);
  assert.equal(poisonCloud.description.en,
    'Has a 30% chance to summon a poison cloud that deals damage to enemies in an area for three seconds.');
  assert.equal(translationsForFact(2222).en,
    'Mob attacks create a poison cloud identical to those that witches throw wherever they land.');
  assert.equal(auditByFactId.get(2222).evidence[0].excerpt,
    'Mob attacks create a poison cloud identical to those that witches throw wherever they land.');

  assert.deepEqual(factValue(protection, 'Player effect'), translationsForFact(2854));
  assert.deepEqual(protection.availability.playerEffect, [translationsForFact(2854).en, translationsForFact(2854)['zh-Hant']]);
  assert.equal(protection.description.en, 'Reduces damage taken.');
  assert.deepEqual(auditByFactId.get(2854).tableCells, ['6%', '11%', '15%']);
  assert.equal(translationsForFact(2856).en, 'The mob takes 50% less damage.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('protection').effect_relation, 'different');

  assert.deepEqual(factValue(radiance, 'Player effect'), translationsForFact(2237));
  assert.deepEqual(radiance.availability.playerEffect, [translationsForFact(2237).en, translationsForFact(2237)['zh-Hant']]);
  assert.equal(radiance.description.en,
    'Has a 20% chance to spawn a circular area that heals you and all allies within the area.');
  assert.equal(translationsForFact(2237).en,
    'Has a 20% chance to spawn a circular area that heals you and all allies within the area; ranged attacks use Radiance Shot, which has a 50% chance to create one.');
  assert.deepEqual(auditByFactId.get(2237).tableCells, ['Melee: 20% chance', 'Radiance Shot: 50% chance']);
  assert.equal(translationsForFact(2239).en,
    'Melee mobs summon a healing aura when attacking; ranged mobs use Radiance Shot to heal themselves and allies.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('radiance').effect_relation, 'unknown');

  assert.equal(batch.facts.find(({ factId }) => factId === 3070).disposition, 'inference_retained');
  assert.equal(batch.facts.find(({ factId }) => factId === 3072).disposition, 'inference_retained');
  assert.equal(translationsForFact(3070).en,
    'Enchanter’s Tome can grant nearby heroes increased movement speed; this is not a gear choice.');
  assert.equal(translationsForFact(3078).en, 'Mobs have higher movement speed. Similar to Swiftness.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('quick').effect_relation, 'unknown');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('eighth enchantment rewrite batch appends verified tier values after source text', () => {
  const batch = progress.batches.find(({ batch }) => batch === 8);
  const expectedEntryIds = [
    'recycler', 'refreshment', 'regeneration', 'reliable-ricochet', 'ricochet', 'roll-charge',
    'rush', 'rushdown', 'shadow-barb', 'shadow-blast', 'shadow-shot', 'shadow-surge',
  ];
  assert.ok(batch, 'Missing eighth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 24);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2325, 2470, 2478, 2894]);
  assert.equal(batch.changedTranslations, 7);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const entry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  const factValue = (item, label) => item.facts.find(({ label: factLabel }) => factLabel.en === label).value;
  const refreshment = entry('refreshment');
  const ricochet = entry('ricochet');
  const rollCharge = entry('roll-charge');
  const reliableRicochet = entry('reliable-ricochet');

  assert.equal(translationsForFact(2325).en,
    "Defeating a mob reduces your health potion's cooldown time, allowing you to heal again more quickly; tiers I / II / III reduce the cooldown by 1 / 2 / 3 seconds, respectively.");
  assert.deepEqual(factValue(refreshment, 'Player effect'), translationsForFact(2325));
  assert.deepEqual(auditByFactId.get(2325).tableCells, ['1 second', '2 seconds', '3 seconds']);
  assert.equal(refreshment.description.en,
    "Defeating a mob reduces your health potion's cooldown time, allowing you to heal again more quickly.");
  assert.equal(translationsForFact(2327).en, 'No mob-side effect is listed in the reviewed Wiki sources.');

  assert.equal(translationsForFact(2470).en,
    'Small chance for arrows to ricochet off mobs; tiers I / II / III have a 20% / 40% / 60% chance to trigger, respectively.');
  assert.deepEqual(factValue(ricochet, 'Player effect'), translationsForFact(2470));
  assert.deepEqual(auditByFactId.get(2470).tableCells, ['20%', '40%', '60%']);
  assert.equal(translationsForFact(2472).en, 'Ranged mob projectiles bounce from hero to hero.');
  assert.equal(database.prepare('SELECT effect_relation FROM enchantment_effect_profiles WHERE entry_id=?').get('ricochet').effect_relation, 'unknown');

  assert.equal(translationsForFact(2478).en,
    'When you perform a roll, your next ranged attack within the timing window will automatically be fully charged; tiers I / II / III keep the next shot charged for 1 / 2 / 3 seconds, respectively.');
  assert.deepEqual(factValue(rollCharge, 'Player effect'), translationsForFact(2478));
  assert.deepEqual(auditByFactId.get(2478).tableCells, ['1 second', '2 seconds', '3 seconds']);
  assert.equal(rollCharge.description.en,
    'When you perform a roll, your next ranged attack within the timing window will automatically be fully charged.');
  assert.equal(translationsForFact(2480).en, 'No mob-side effect is listed in the reviewed Wiki sources.');

  assert.equal(translationsForFact(2894).en, 'Hits Multiple targets when charged');
  assert.equal(translationsForFact(2894)['zh-Hant'], '蓄力箭可命中多個目標。');
  assert.deepEqual(factValue(reliableRicochet, 'Player effect'), translationsForFact(2894));
  assert.equal(reliableRicochet.description.en, 'Hits Multiple targets when charged');
  assert.equal(translationsForFact(3000).en, 'Mobs regenerate health after avoiding damage for ten seconds.');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('ninth enchantment rewrite batch records the remaining verified tier values', () => {
  const batch = progress.batches.find(({ batch }) => batch === 9);
  const expectedEntryIds = [
    'shared-pain', 'sharpness', 'shielding', 'shock-web', 'shockwave', 'smiting',
    'snowball', 'soul-focus', 'soul-siphon', 'soul-speed', 'speed-synergy', 'stunning',
  ];
  assert.ok(batch, 'Missing ninth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 25);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [
    2253, 2261, 2269, 2277, 2333, 2526, 2734, 2742, 2750, 2862,
  ]);
  assert.equal(batch.changedTranslations, 20);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const expectedTiers = new Map([
    [2253, ['+10%', '+21%', '+33%']],
    [2526, ['1 beam', '2 beams', '3 beams']],
    [2333, ['X', '1.5X', '2X']],
    [2261, ['+25%', '+35%', '+45%']],
    [2734, ['5 seconds', '3 seconds', '1 second']],
    [2862, ['+10%', '+20%', '+30%']],
    [2269, ['1 soul', '3 souls', '5 souls']],
    [2742, ['3 seconds', '5 seconds', '7 seconds']],
    [2750, ['1 second', '2 seconds', '3 seconds']],
    [2277, ['5%', '10%', '15%']],
  ]);
  const rosterEntry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  for (const [factId, cells] of expectedTiers) {
    const record = batch.facts.find(({ factId: id }) => id === factId);
    const audited = auditByFactId.get(factId);
    const item = rosterEntry(record.entryId);
    const playerFact = item.facts.find(({ label }) => label.en === 'Player effect');
    assert.deepEqual(audited.tableCells, cells, `Tier cells mismatch for ${record.entryId}`);
    assert.deepEqual(playerFact.value, record.next);
    assert.deepEqual(item.availability.playerEffect, [record.next.en, record.next['zh-Hant']]);
    assert.equal(item.description.en, record.sourceText, `Original description changed for ${record.entryId}`);
  }

  assert.equal(translationsForFact(2333).en,
    'The last attack in a combo launches a shockwave, damaging enemies; shockwave damage at tiers I / II / III is X / 1.5X / 2X, respectively.');
  assert.equal(translationsForFact(2335).en,
    'After an attack, the mob projects a damaging wave in the direction of that attack.');
  assert.equal(translationsForFact(3008).en.startsWith('Unconfirmed:'), true);
  assert.equal(batch.facts.find(({ factId }) => factId === 2255).disposition, 'inference_retained');
  assert.equal(translationsForFact(3075).en, 'Mob melee damage increases.');
  assert.equal(translationsForFact(2279).en,
    'The mob may stun the hero when its attack kills them; the Wiki marks this behavior as unverified.');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('tenth enchantment rewrite batch retains source wording and per-type tier values', () => {
  const batch = progress.batches.find(({ batch }) => batch === 10);
  const expectedEntryIds = [
    'supercharge', 'surprise-gift', 'swiftfooted', 'swirling', 'synergy', 'tempo-theft',
    'thorns', 'thrive-under-pressure', 'thundering', 'tumblebee', 'unchanting', 'void-strike',
  ];
  assert.ok(batch, 'Missing tenth-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 24);
  assert.equal(batch.profiles.length, 12);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [
    2285, 2293, 2341, 2350, 2486, 2534, 2758, 2766, 2774, 2782,
  ]);
  assert.equal(batch.changedTranslations, 20);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const expectedTiers = new Map([
    [2486, ['+20%', '+30%', '+40%']],
    [2758, ['50%', '100%', '150%']],
    [2766, ['+30%', '+40%', '+50%']],
    [2341, ['X', '1.5X', '2X']],
    [2534, ['17%', '33%', '50%']],
    [2774, ['100%', '150%', '200%']],
    [2285, ['X', '2X', '3X']],
    [2782, ['33%', '67%', '101%']],
    [2293, ['+50%', '+75%', '+100%']],
    [2350, [
      'Melee: +200%; Ranged: +100%',
      'Melee: +400%; Ranged: +200%',
      'Melee: +600%; Ranged: +300%',
    ]],
  ]);
  const rosterEntry = (id) => roster.entries.find(({ id: entryId }) => entryId === id);
  for (const [factId, cells] of expectedTiers) {
    const record = batch.facts.find(({ factId: id }) => id === factId);
    const audited = auditByFactId.get(factId);
    const item = rosterEntry(record.entryId);
    const playerFact = item.facts.find(({ label }) => label.en === 'Player effect');
    assert.deepEqual(audited.tableCells, cells, `Tier cells mismatch for ${record.entryId}`);
    assert.deepEqual(playerFact.value, record.next);
    assert.deepEqual(item.availability.playerEffect, [record.next.en, record.next['zh-Hant']]);
    assert.equal(item.description.en, record.sourceText, `Original description changed for ${record.entryId}`);
  }

  assert.equal(translationsForFact(2341).en,
    'The last attack in a combo performs a swirling attack, damaging nearby enemies; tiers I / II / III deal X / 1.5X / 2X damage with the swirling attack, respectively.');
  assert.equal(translationsForFact(2776).en, 'The mob returns 12.5% of damage it receives to its attacker.');
  assert.equal(translationsForFact(2287).en,
    'A lightning strike targets nearby heroes after each mob attack.');
  assert.equal(translationsForFact(3016).en.startsWith('Unconfirmed:'), true);
  assert.equal(translationsForFact(2350).en,
    'Attacking a target applies a damage multiplier that rises steadily to a max level, then is removed; tiers I / II / III have maximum damage multiplier bonuses of +200% / +400% / +600% for melee attacks and +100% / +200% / +300% for ranged attacks, respectively.');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test('eleventh enchantment rewrite batch completes the roster and appends the final tier values', () => {
  const batch = progress.batches.find(({ batch }) => batch === 11);
  const expectedEntryIds = ['weakening', 'wild-rage', 'wind-bow-enchantment', 'withering'];
  assert.ok(batch, 'Missing eleventh-batch rewrite record');
  assert.deepEqual(batch.entryIds, expectedEntryIds);
  assert.equal(batch.facts.length, 8);
  assert.equal(batch.profiles.length, 4);
  assert.equal(progress.batches.reduce((count, current) => count + current.reviewedEntries, 0), 124);
  assert.equal(progress.batches.reduce((count, current) => count + current.reviewedFacts, 0), 253);

  const changed = batch.facts.filter(({ disposition }) => disposition === 'rewritten');
  assert.deepEqual(changed.map(({ factId }) => factId).sort((a, b) => a - b), [2301, 2494]);
  assert.equal(batch.changedTranslations, 4);

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  for (const record of batch.facts) {
    const current = translationsForFact(record.factId);
    const audited = auditByFactId.get(record.factId);
    assert.deepEqual(current, record.next, `Database value mismatch for fact ${record.factId}`);
    assert.deepEqual(audited.claim, record.next, `Audit claim mismatch for fact ${record.factId}`);
    assert.equal(audited.entryId, record.entryId);
    assert.equal(audited.semanticKey, record.semanticKey);
    assert.equal(audited.claimOrigin, record.claimOrigin);
    assert.equal(audited.wikiStatus, record.wikiStatus);
    assert.deepEqual(audited.evidence, record.sourceEvidence, `Source evidence changed for fact ${record.factId}`);
    assert.deepEqual(audited.tableCells ?? null, record.tableCells);
  }

  const weakening = roster.entries.find(({ id }) => id === 'weakening');
  const wildRage = roster.entries.find(({ id }) => id === 'wild-rage');
  assert.equal(translationsForFact(2301).en,
    'Your attacks decrease the attack damage of all nearby enemies for five seconds; tiers I / II / III reduce enemy attack damage by 20% / 30% / 40%, respectively.');
  assert.deepEqual(auditByFactId.get(2301).tableCells, ['20%', '30%', '40%']);
  assert.deepEqual(weakening.availability.playerEffect, [translationsForFact(2301).en, translationsForFact(2301)['zh-Hant']]);
  assert.equal(translationsForFact(2303).en,
    'Mob attacks inflict Weakened on the hero for five seconds, reducing the hero’s attack damage.');

  assert.equal(translationsForFact(2494).en,
    'Hitting an enemy has a chance to send it into a rage, making it hostile towards everyone; tiers I / II / III have a 20% / 30% / 40% chance to trigger, respectively.');
  assert.deepEqual(auditByFactId.get(2494).tableCells, ['20%', '30%', '40%']);
  assert.deepEqual(wildRage.availability.playerEffect, [translationsForFact(2494).en, translationsForFact(2494)['zh-Hant']]);
  assert.equal(translationsForFact(2496).en, 'No mob-side effect is listed in the reviewed Wiki sources.');
  assert.equal(translationsForFact(2918).en,
    'Fully charged arrows become gale arrows; hitting an enemy with one forms a helix of wind that pulls the enemy closer to the player.');
  assert.equal(translationsForFact(2960).en,
    'Wither Skeletons and Wither Skeleton Archers apply Wither through their stone sword and red snake, respectively.');
  assert.equal(weakening.description.en, 'Your attacks decrease the attack damage of all nearby enemies for five seconds.');
  assert.equal(wildRage.description.en,
    'Hitting an enemy has a chance to send it into a rage, making it hostile towards everyone.');

  const profileRows = database.prepare(`SELECT entry_id AS entryId,
      player_availability AS playerAvailability, mob_availability AS mobAvailability,
      effect_relation AS effectRelation, player_fact_id AS playerFactId, mob_fact_id AS mobFactId
    FROM enchantment_effect_profiles WHERE entry_id IN (${expectedEntryIds.map(() => '?').join(',')}) ORDER BY entry_id`).all(...expectedEntryIds);
  const loggedProfiles = new Map(batch.profiles.map((profile) => [profile.entryId, profile]));
  for (const profile of profileRows) assert.deepEqual(loggedProfiles.get(profile.entryId), { ...profile });
});

test.after(() => database.close());
