import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';

const database = new DatabaseSync(new URL('../content/catalog.sqlite', import.meta.url), { readOnly: true });
const auditPath = new URL('../docs/audits/enchantment-effect-facts.json', import.meta.url);

test('124 enchantments have fact-level source decisions for both effects and relation', () => {
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
  const facts = database.prepare(`SELECT facts.id AS factId, facts.entry_id AS entryId,
      facts.semantic_key AS semanticKey, facts.claim_origin AS claimOrigin,
      facts.wiki_status AS wikiStatus,
      MAX(CASE WHEN translations.language='en' THEN translations.value END) AS en,
      MAX(CASE WHEN translations.language='zh-Hant' THEN translations.value END) AS zh,
      GROUP_CONCAT(CASE WHEN evidence.relation='supports' THEN sources.label END) AS supportLabels
    FROM facts
    JOIN fact_translations AS translations ON translations.fact_id=facts.id
    LEFT JOIN fact_evidence AS evidence ON evidence.fact_id=facts.id
    LEFT JOIN entry_sources AS sources ON sources.id=evidence.source_id
    WHERE facts.semantic_key IN ('player_effect','mob_effect')
    GROUP BY facts.id
    ORDER BY facts.entry_id,facts.semantic_key`).all();
  const profiles = database.prepare(`SELECT entry_id AS entryId, effect_relation AS effectRelation
    FROM enchantment_effect_profiles ORDER BY entry_id`).all();

  assert.equal(audit.facts.length, 253);
  assert.equal(audit.effectRelations.length, 124);
  assert.deepEqual(audit.facts.map(({ factId }) => factId).sort((a, b) => a - b), facts.map(({ factId }) => factId).sort((a, b) => a - b));
  assert.deepEqual(audit.effectRelations.map(({ entryId }) => entryId).sort(), profiles.map(({ entryId }) => entryId).sort());

  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));
  assert.equal(audit.facts.filter(({ decision }) => decision === 'not_audited').length, 0,
    'Every effect fact must carry an explicit audit outcome.');
  for (const fact of facts) {
    const record = auditByFactId.get(fact.factId);
    assert.ok(record, `Missing audit for fact ${fact.factId}`);
    assert.equal(record.entryId, fact.entryId);
    assert.equal(record.semanticKey, fact.semanticKey);
    assert.equal(record.claimOrigin, fact.claimOrigin);
    assert.equal(record.wikiStatus, fact.wikiStatus);
    assert.deepEqual(record.claim, { en: fact.en, 'zh-Hant': fact.zh });
    assert.ok(['high', 'medium', 'low', 'unknown'].includes(record.confidence), `Invalid confidence for ${fact.entryId}/${fact.semanticKey}`);

    if (fact.claimOrigin === 'source') {
      assert.ok(record.evidence.some(({ relation }) => relation === 'supports'), `Source fact ${fact.factId} has no audited support`);
      for (const evidence of record.evidence.filter(({ relation }) => relation === 'supports')) {
        assert.ok(fact.supportLabels?.split(',').includes(audit.sources[evidence.sourceKey]?.label), `Fact ${fact.factId} is missing DB support from ${evidence.sourceKey}`);
        assert.ok(evidence.excerpt?.trim(), `Fact ${fact.factId} has no verbatim excerpt`);
        assert.ok(evidence.revisionId, `Fact ${fact.factId} has no pinned source revision`);
      }
    }
  }

  const relationsById = new Map(audit.effectRelations.map((relation) => [relation.entryId, relation]));
  for (const profile of profiles) {
    const relation = relationsById.get(profile.entryId);
    assert.equal(relation.effectRelation, profile.effectRelation, `Relation audit mismatch for ${profile.entryId}`);
    assert.ok(['high', 'medium', 'low', 'unknown'].includes(relation.confidence));
    assert.ok(relation.rationale.trim(), `Missing relation rationale for ${profile.entryId}`);
  }

  const junglePoison = facts.find(({ entryId, semanticKey }) => entryId === 'jungle-poison' && semanticKey === 'mob_effect');
  assert.equal(junglePoison.claimOrigin, 'inference');
  assert.equal(junglePoison.supportLabels, null);
  assert.equal(relationsById.get('jungle-poison').effectRelation, 'unknown');
  assert.equal(relationsById.get('ambush').effectRelation, 'unknown');

  const directlyQuotedMobEffects = new Map([
    ['double-damage', 'Mobs deal 2 times as much damage to the hero. Similar to the Strength potion.'],
    ['fast-attack', 'Mob attack speed increases.'],
    ['quick', 'Mobs have higher movement speed. Similar to Swiftness.'],
    ['leeching', 'Mobs gain a percent of the hero’s health every time they attack.'],
    ['sharpness', 'Mob melee damage increases.'],
  ]);
  for (const [entryId, excerpt] of directlyQuotedMobEffects) {
    const fact = facts.find((item) => item.entryId === entryId && item.semanticKey === 'mob_effect' && item.claimOrigin === 'source');
    const record = auditByFactId.get(fact.factId);
    assert.equal(record.claim.en, excerpt, `${entryId} effect claim must not absorb availability/history clauses`);
    assert.ok(record.evidence.some(({ relation, excerpt: sourceExcerpt }) =>
      relation === 'supports' && sourceExcerpt === excerpt), `${entryId} complete effect claim must have matching source evidence`);
  }
});

test('source-effect evidence uses the reviewed pinned Wiki revisions', () => {
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
  const supported = audit.facts.filter(({ claimOrigin }) => claimOrigin === 'source');
  assert.ok(supported.length > 100);
  for (const fact of supported) {
    for (const evidence of fact.evidence.filter(({ relation }) => relation === 'supports')) {
      const source = audit.sources[evidence.sourceKey];
      assert.ok(source, `Unknown source key ${evidence.sourceKey}`);
      assert.equal(source.revisionId, evidence.revisionId);
      assert.match(source.url, new RegExp(`oldid=${source.revisionId}(?:&|$)`));
    }
  }
});

test('five legacy mob-effect claims remain intact as inference beside pure sourced effects', () => {
  const cases = [
    {
      id: 'leeching', factId: 2198,
      legacy: {
        en: 'Ancient mobs gain a portion of the hero’s health whenever they attack; the Wiki history also mentions Mystery Banner mobs.',
        zh: '遠古怪物每次攻擊會取得英雄生命值的一部分；Wiki 更新紀錄亦提到神秘旗幟怪物。',
      },
      effect: { en: 'Mobs gain a percent of the hero’s health every time they attack.', zh: '怪物每次攻擊都會取得英雄生命值的一部分。' },
    },
    {
      id: 'sharpness', factId: 2255,
      legacy: {
        en: 'Ancient mobs deal increased melee damage; the Wiki history also mentions Mystery Banner mobs.',
        zh: '遠古怪物會造成額外近戰傷害；Wiki 更新紀錄亦提到神秘旗幟怪物。',
      },
      effect: { en: 'Mob melee damage increases.', zh: '提高怪物的近戰傷害。' },
    },
    {
      id: 'double-damage', factId: 3056,
      legacy: {
        en: 'Mobs deal twice as much damage to the hero. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.',
        zh: '怪物對英雄造成雙倍傷害。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。',
      },
      effect: { en: 'Mobs deal 2 times as much damage to the hero. Similar to the Strength potion.', zh: '怪物對英雄造成 2 倍傷害，效果類似力量藥水。' },
    },
    {
      id: 'fast-attack', factId: 3064,
      legacy: {
        en: 'Increases the mob’s attack speed. Enchanters can apply it to nearby mobs; the Tome can apply it to heroes and summons.',
        zh: '提高怪物攻擊速度。附魔師可施加給附近怪物；附魔師之書可施加給英雄與召喚物。',
      },
      effect: { en: 'Mob attack speed increases.', zh: '提高怪物攻擊速度。' },
    },
    {
      id: 'quick', factId: 3072,
      legacy: {
        en: 'Increases the mob’s movement speed. The Tome can also apply it to heroes and summoned allies.',
        zh: '提高怪物移動速度。附魔師之書也可將此效果施加給英雄與召喚盟友。',
      },
      effect: { en: 'Mobs have higher movement speed. Similar to Swiftness.', zh: '怪物移動速度提高，效果類似迅捷藥水。' },
    },
  ];
  const audit = JSON.parse(readFileSync(auditPath, 'utf8'));
  const auditByFactId = new Map(audit.facts.map((fact) => [fact.factId, fact]));

  assert.equal(audit.facts.length, 253);
  for (const item of cases) {
    const legacy = database.prepare(`SELECT facts.id AS factId, facts.claim_origin AS claimOrigin,
        MAX(CASE WHEN translations.language='en' THEN translations.value END) AS en,
        MAX(CASE WHEN translations.language='zh-Hant' THEN translations.value END) AS zh,
        SUM(CASE WHEN evidence.relation='supports' THEN 1 ELSE 0 END) AS supportCount
      FROM facts JOIN fact_translations AS translations ON translations.fact_id=facts.id
      LEFT JOIN fact_evidence AS evidence ON evidence.fact_id=facts.id
      WHERE facts.id=? GROUP BY facts.id`).get(item.factId);
    assert.equal(legacy.claimOrigin, 'inference', `${item.id} keeps its composite claim as inference`);
    assert.deepEqual({ en: legacy.en, zh: legacy.zh }, item.legacy, `${item.id} preserves the original claim`);
    assert.equal(legacy.supportCount, 0, `${item.id} composite claim is not presented as wholly supported`);

    const profile = database.prepare(`SELECT mob_fact_id AS mobFactId FROM enchantment_effect_profiles WHERE entry_id=?`).get(item.id);
    assert.notEqual(profile.mobFactId, item.factId, `${item.id} profile points at the pure source effect`);
    const effect = database.prepare(`SELECT facts.id AS factId, facts.claim_origin AS claimOrigin,
        MAX(CASE WHEN translations.language='en' THEN translations.value END) AS en,
        MAX(CASE WHEN translations.language='zh-Hant' THEN translations.value END) AS zh,
        GROUP_CONCAT(CASE WHEN evidence.relation='supports' THEN sources.label END) AS supportLabels
      FROM facts JOIN fact_translations AS translations ON translations.fact_id=facts.id
      LEFT JOIN fact_evidence AS evidence ON evidence.fact_id=facts.id
      LEFT JOIN entry_sources AS sources ON sources.id=evidence.source_id
      WHERE facts.id=? GROUP BY facts.id`).get(profile.mobFactId);
    assert.equal(effect.claimOrigin, 'source');
    assert.deepEqual({ en: effect.en, zh: effect.zh }, item.effect, `${item.id} has a separate pure effect fact`);
    assert.match(effect.supportLabels, /Minecraft Wiki · Enchanted Mobs/);

    assert.equal(auditByFactId.get(item.factId)?.decision, 'partial');
    assert.equal(auditByFactId.get(profile.mobFactId)?.decision, 'supported');
  }
});

test.after(() => database.close());
