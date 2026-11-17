PRAGMA foreign_keys = ON;

BEGIN;

CREATE TABLE entry_built_in_enchantments (
  link_id INTEGER PRIMARY KEY REFERENCES entry_links(id) ON DELETE CASCADE,
  property_icon TEXT NOT NULL CHECK (property_icon IN ('regular-bullet', 'unique-bullet')),
  tier INTEGER CHECK (tier IS NULL OR tier BETWEEN 1 AND 3)
);

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'diamond-sword' AND target_entry_id = 'sharpness';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'hawkbrand' AND target_entry_id = 'critical-hit';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'sinister-sword' AND target_entry_id = 'critical-hit';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'anchor' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'encrusted-anchor' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'encrusted-anchor' AND target_entry_id = 'jungle-poison';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'firebrand' AND target_entry_id = 'fire-aspect';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'highland-axe' AND target_entry_id = 'stunning';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'backstabber' AND target_entry_id = 'ambush';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'swift-striker' AND target_entry_id = 'ambush';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'swift-striker' AND target_entry_id = 'echo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'battlestaff-of-terror' AND target_entry_id = 'exploding';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'growing-staff' AND target_entry_id = 'committed';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'bone-cudgel' AND target_entry_id = 'illagers-bane';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'broadsword' AND target_entry_id = 'sharpness';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'frost-slayer' AND target_entry_id = 'sharpness';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'great-axeblade' AND target_entry_id = 'dynamo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'heartstealer' AND target_entry_id = 'leeching';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'dancers-sword' AND target_entry_id = 'rampaging';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'nameless-blade' AND target_entry_id = 'weakening';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'sparkler' AND target_entry_id = 'rampaging';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'fangs-of-frost' AND target_entry_id = 'freezing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'moon-daggers' AND target_entry_id = 'enigma-resonator';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'sheer-daggers' AND target_entry_id = 'swirling';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'cursed-axe' AND target_entry_id = 'exploding';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'whirlwind' AND target_entry_id = 'shockwave';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'maulers' AND target_entry_id = 'rampaging';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'soul-fists' AND target_entry_id = 'enigma-resonator';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'cackling-broom' AND target_entry_id = 'smiting';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'grave-bane' AND target_entry_id = 'smiting';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'venom-glaive' AND target_entry_id = 'poison-cloud';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'bonehead-hammer' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'hammer-of-gravity' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'stormlander' AND target_entry_id = 'thundering';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'dark-katana' AND target_entry_id = 'smiting';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'masters-katana' AND target_entry_id = 'critical-hit';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'flail' AND target_entry_id = 'chains';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'suns-grace' AND target_entry_id = 'radiance';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'the-starless-night' AND target_entry_id = 'shared-pain';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'diamond-pickaxe' AND target_entry_id = 'prospector';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'bee-stinger' AND target_entry_id = 'busy-bee';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'freezing-foil' AND target_entry_id = 'freezing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'nightmares-bite' AND target_entry_id = 'poison-cloud';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'the-last-laugh' AND target_entry_id = 'prospector';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'eternal-knife' AND target_entry_id = 'soul-siphon';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'truthseeker' AND target_entry_id = 'committed';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'frost-scythe' AND target_entry_id = 'freezing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'jailors-scythe' AND target_entry_id = 'chains';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'skull-scythe' AND target_entry_id = 'freezing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'fortune-spear' AND target_entry_id = 'looting';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'spine-chill-spear' AND target_entry_id = 'echo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'whispering-spear' AND target_entry_id = 'echo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'tempest-knife' AND target_entry_id = 'rushdown';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'chill-gale-knife' AND target_entry_id = 'rushdown';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'chill-gale-knife' AND target_entry_id = 'freezing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'resolute-tempest-knife' AND target_entry_id = 'rushdown';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'resolute-tempest-knife' AND target_entry_id = 'committed';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'void-touched-blades' AND target_entry_id = 'void-strike';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'the-beginning-and-the-end' AND target_entry_id = 'void-strike';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'the-beginning-and-the-end' AND target_entry_id = 'leeching';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'vine-whip' AND target_entry_id = 'jungle-poison';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'bonebow' AND target_entry_id = 'growing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'haunted-bow' AND target_entry_id = 'bonus-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'twin-bow' AND target_entry_id = 'bonus-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'bubble-burster' AND target_entry_id = 'reliable-ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'gloopy-bow' AND target_entry_id = 'reliable-ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'corrupted-crossbow' AND target_entry_id = 'dynamo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'soul-hunter-crossbow' AND target_entry_id = 'enigma-resonator';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'pride-of-the-piglins' AND target_entry_id = 'piercing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'azure-seeker' AND target_entry_id = 'rapid-fire';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'the-slicer' AND target_entry_id = 'piercing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'baby-crossbows' AND target_entry_id = 'growing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'spellbound-crossbows' AND target_entry_id = 'unchanting';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'firebolt-thrower' AND target_entry_id = 'chain-reaction';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'imploding-crossbow' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 3
FROM entry_links WHERE entry_id = 'nautical-crossbow' AND target_entry_id = 'piercing';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'doom-crossbow' AND target_entry_id = 'punch';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'slayer-crossbow' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'ancient-bow' AND target_entry_id = 'dynamo';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'hunters-promise' AND target_entry_id = 'infinity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'masters-bow' AND target_entry_id = 'power';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 2
FROM entry_links WHERE entry_id = 'guardian-bow' AND target_entry_id = 'supercharge';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'red-snake' AND target_entry_id = 'supercharge';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'red-snake' AND target_entry_id = 'fuse-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'elite-power-bow' AND target_entry_id = 'power';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'phantom-bow' AND target_entry_id = 'supercharge';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'phantom-bow' AND target_entry_id = 'power';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'sabrewing' AND target_entry_id = 'radiance';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'auto-crossbow' AND target_entry_id = 'accelerate';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'butterfly-crossbow' AND target_entry_id = 'bonus-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'lightning-harp-crossbow' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', NULL
FROM entry_links WHERE entry_id = 'shadow-crossbow' AND target_entry_id = 'shadow-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', NULL
FROM entry_links WHERE entry_id = 'shrieking-crossbow' AND target_entry_id = 'shadow-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'shrieking-crossbow' AND target_entry_id = 'shadow-barb';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', NULL
FROM entry_links WHERE entry_id = 'veiled-crossbow' AND target_entry_id = 'shadow-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', NULL
FROM entry_links WHERE entry_id = 'veiled-crossbow' AND target_entry_id = 'shadow-barb';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'love-spell-bow' AND target_entry_id = 'wild-rage';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'mechanical-shortbow' AND target_entry_id = 'accelerate';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'purple-storm' AND target_entry_id = 'rapid-fire';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'bow-of-lost-souls' AND target_entry_id = 'multishot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'nocturnal-bow' AND target_entry_id = 'tempo-theft';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'shivering-bow' AND target_entry_id = 'tempo-theft';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'feral-soul-crossbow' AND target_entry_id = 'enigma-resonator';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'voidcaller' AND target_entry_id = 'gravity';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'trickbow' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'the-green-menace' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'the-green-menace' AND target_entry_id = 'poison-cloud';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'the-pink-scoundrel' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'the-pink-scoundrel' AND target_entry_id = 'wild-rage';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'sugar-rush' AND target_entry_id = 'ricochet';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'sugar-rush' AND target_entry_id = 'wild-rage';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'weeping-vine-bow' AND target_entry_id = 'roll-charge';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'void-bow' AND target_entry_id = 'void-strike';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'regular-bullet', 1
FROM entry_links WHERE entry_id = 'call-of-the-void' AND target_entry_id = 'void-strike';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'call-of-the-void' AND target_entry_id = 'fuse-shot';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'burst-gale-bow' AND target_entry_id = 'roll-charge';

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier)
SELECT id, 'unique-bullet', 1
FROM entry_links WHERE entry_id = 'echo-of-the-valley' AND target_entry_id = 'ricochet';

UPDATE traits SET icon = 'regular-bullet' WHERE id = (SELECT traits.id FROM traits JOIN trait_translations ON trait_translations.trait_id = traits.id WHERE traits.entry_id = 'call-of-the-void' AND trait_translations.language = 'en' AND trait_translations.label = 'Applies rising damage multiplier');

PRAGMA user_version = 4;

COMMIT;
