import { buildBuiltInEnchantmentPresentation } from './built-in-enchantment-presentation.mjs';

const effectKeys = new Set(['player_effect', 'mob_effect']);

function orderFacts(facts) {
  return [...facts].sort((left, right) => left.position - right.position);
}

function hasSupportingSource(fact) {
  return fact.claimOrigin === 'source' && fact.evidence.some(({ relation }) => relation === 'supports');
}

function effectFor(entry, side, factId) {
  if (factId === null) return null;
  const fact = entry.facts.find(({ id }) => id === factId);
  if (!fact) throw new Error(`附魔 ${entry.id} 指向不存在的 ${side} 效果 fact：${factId}`);
  if (fact.semanticKey !== `${side}_effect`) {
    throw new Error(`附魔 ${entry.id} 的 ${side} 效果 fact 語意不符：${fact.semanticKey}`);
  }
  return fact;
}

function deriveEffects(entry) {
  const profile = entry.enchantmentEffectProfile;
  if (!profile) return { effects: [], unresolvedRelations: [], relationAssessment: null };

  const sides = [
    ['player', profile.playerAvailability, effectFor(entry, 'player', profile.playerFactId)],
    ['mob', profile.mobAvailability, effectFor(entry, 'mob', profile.mobFactId)],
  ];
  const visible = [];
  for (const [side, availability, fact] of sides) {
    if (!fact || !hasSupportingSource(fact) || availability === 'unavailable') continue;
    visible.push({ side, fact, wikiStatus: fact.wikiStatus, availabilityUnconfirmed: availability === 'unknown' });
  }

  if (profile.effectRelation === 'same') {
    const player = visible.find(({ side }) => side === 'player');
    const mob = visible.find(({ side }) => side === 'mob');
    if (player && mob) {
      return {
        effects: [player, { ...mob, sameAsPlayer: true }],
        unresolvedRelations: [],
        relationAssessment: { relation: 'same' },
      };
    }
  }
  if (profile.effectRelation === 'unknown') {
    const player = visible.find(({ side }) => side === 'player');
    const mob = visible.find(({ side }) => side === 'mob');
    if (player && mob) {
      return { effects: visible, unresolvedRelations: [{ reason: 'relation' }], relationAssessment: null };
    }
  }
  const hasBothSides = visible.some(({ side }) => side === 'player') && visible.some(({ side }) => side === 'mob');
  return {
    effects: visible,
    unresolvedRelations: [],
    relationAssessment: hasBothSides && profile.effectRelation === 'different'
      ? { relation: 'different' }
      : null,
  };
}

export function deriveDetailPresentation(entry, entries) {
  if (!entry || !Array.isArray(entry.facts) || !Array.isArray(entry.links)) {
    throw new TypeError('詳情呈現政策需要完整條目資料。');
  }
  const builtIn = buildBuiltInEnchantmentPresentation(entry, entries);
  const { effects, unresolvedRelations, relationAssessment } = deriveEffects(entry);
  const effectFacts = entry.facts.filter(({ semanticKey }) => effectKeys.has(semanticKey));
  const hiddenEffectFacts = effectFacts.filter((fact) => {
    const side = fact.semanticKey === 'player_effect' ? 'player' : 'mob';
    const availability = entry.enchantmentEffectProfile?.[`${side}Availability`];
    return hasSupportingSource(fact) && availability !== 'unavailable'
      && !effects.some((effect) => effect.fact.id === fact.id);
  });
  const descriptionIsSource = entry.descriptionStatus === 'source';
  const wikiOriginals = descriptionIsSource
    ? [{ key: 'description', value: entry.description.en }]
    : [];
  for (const fact of effectFacts) {
    const side = fact.semanticKey === 'player_effect' ? 'player' : 'mob';
    const availability = entry.enchantmentEffectProfile?.[`${side}Availability`];
    if (hasSupportingSource(fact) && availability !== 'unavailable' && fact.value.en !== entry.description.en) {
      wikiOriginals.push({ key: fact.semanticKey, value: fact.value.en, wikiStatus: fact.wikiStatus });
    }
  }

  const primaryFacts = orderFacts(entry.facts.filter((fact) => hasSupportingSource(fact) && !effectKeys.has(fact.semanticKey)));
  const moreInfoFacts = orderFacts([
    ...entry.facts.filter((fact) => fact.claimOrigin !== 'source'),
    ...hiddenEffectFacts,
  ]);
  const description = entry.category !== 'enchantments' && descriptionIsSource ? entry.description : null;
  const hasMoreInfo = moreInfoFacts.length > 0 || unresolvedRelations.length > 0
    || relationAssessment !== null || wikiOriginals.length > 0;
  const sections = [
    ...(effects.length ? [{ type: 'effects', items: effects }] : []),
    ...(primaryFacts.length ? [{ type: 'facts', items: primaryFacts }] : []),
    ...(builtIn.traits.length ? [{ type: 'traits', items: builtIn.traits }] : []),
    ...(description ? [{ type: 'description', item: description }] : []),
    ...(builtIn.related.length ? [{ type: 'related', items: builtIn.related }] : []),
    ...(hasMoreInfo ? [{ type: 'more_info', facts: moreInfoFacts, unresolvedRelations, relationAssessment, wikiOriginals }] : []),
    ...(entry.sources.length ? [{ type: 'sources', items: entry.sources }] : []),
  ];

  return {
    effects,
    primaryFacts,
    traits: builtIn.traits,
    related: builtIn.related,
    moreInfoFacts,
    unresolvedRelations,
    relationAssessment,
    wikiOriginals,
    description,
    sections,
  };
}
