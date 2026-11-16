import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconAssets } from '../src/icon-assets.mjs';

const WIKI_ORIGIN = 'https://minecraft.wiki';
const API_URL = new URL('/api.php', WIKI_ORIGIN);
const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const USER_AGENT = 'MinecraftDungeonsWikiIconSync/1.0 (local asset maintenance)';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// These are the files labeled as the icon on the article pages, plus the
// shared built-in-property markers. Keep each article page as the
// human-readable source; the API only resolves its current uploaded file.
const sourceEntries = [
  { id: 'ambush', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite ambush.png' },
  { id: 'anima-conduit', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite anima-conduit.png' },
  { id: 'artifact-synergy', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite artifact-synergy.png' },
  { id: 'busy-bee', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite busy-bee.png' },
  { id: 'chains', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite chains.png' },
  { id: 'committed', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite committed.png' },
  { id: 'dynamo', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite dynamo.png' },
  { id: 'echo', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite echo.png' },
  { id: 'enigma-resonator', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite enigma-resonator.png' },
  { id: 'fire-aspect', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite fire-aspect.png' },
  { id: 'freezing', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite freezing.png' },
  { id: 'gravity', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite gravity.png' },
  { id: 'guarding-strike', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite guarding-strike.png' },
  { id: 'illagers-bane', page: 'Dungeons:Enchantment', fileTitle: "File:DungeonsEnchantmentSprite illager's-bane.png" },
  { id: 'leeching', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite leeching.png' },
  { id: 'looting', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite looting.png' },
  { id: 'pain-cycle', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite pain-cycle.png' },
  { id: 'poison-cloud', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite poison-cloud.png' },
  { id: 'prospector', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite prospector.png' },
  { id: 'radiance', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite radiance-melee.png' },
  { id: 'rampaging', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite rampaging.png' },
  { id: 'smiting', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite smiting.png' },
  { id: 'soul-siphon', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite soul-siphon.png' },
  { id: 'stunning', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite stunning.png' },
  { id: 'thundering', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite thundering.png' },
  { id: 'unchanting', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite unchanting.png' },
  { id: 'weakening', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite weakening.png' },
  { id: 'critical-hit', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite critical-hit.png' },
  { id: 'exploding', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite exploding.png' },
  { id: 'refreshment', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite refreshment.png' },
  { id: 'shockwave', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shockwave.png' },
  { id: 'void-strike', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite void-strike-melee.png' },
  { id: 'accelerate', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite accelerate.png' },
  { id: 'artifact-charge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite artifact-charge.png' },
  { id: 'bonus-shot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite bonus-shot.png' },
  { id: 'burst-bowstring', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite burst-bowstring.png' },
  { id: 'cooldown-shot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite cooldown-shot.png' },
  { id: 'dipping-poison', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite dipping-poison.png' },
  { id: 'fuse-shot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite fuse-shot.png' },
  { id: 'growing', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite growing.png' },
  { id: 'infinity', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite infinity.png' },
  { id: 'multishot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite multishot.png' },
  { id: 'piercing', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite piercing.png' },
  { id: 'power', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite power.png' },
  { id: 'punch', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite punch.png' },
  { id: 'rapid-fire', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite rapid-fire.png' },
  { id: 'ricochet', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite ricochet.png' },
  { id: 'roll-charge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite roll-charge.png' },
  { id: 'supercharge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite supercharge.png' },
  { id: 'wild-rage', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite wild-rage.png' },
  { id: 'chain-reaction', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite chain-reaction.png' },
  { id: 'levitation-shot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite levitation-shot.png' },
  { id: 'overcharge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite overcharge.png' },
  { id: 'shock-web', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shock-web.png' },
  { id: 'tempo-theft', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite tempo-theft.png' },
  { id: 'acrobat', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite acrobat.png' },
  { id: 'bag-of-souls', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite bag-of-souls.png' },
  { id: 'beast-boss', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite beast-boss.png' },
  { id: 'beast-burst', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite beast-burst.png' },
  { id: 'beast-surge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite beast-surge.png' },
  { id: 'burning', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite burning.png' },
  { id: 'cool-down', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite cool-down.png' },
  { id: 'cowardice', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite cowardice.png' },
  { id: 'deflect', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite deflect.png' },
  { id: 'electrified', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite electrified.png' },
  { id: 'explorer', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite explorer.png' },
  { id: 'fire-trail', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite fire-trail.png' },
  { id: 'food-reserves', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite food-reserves.png' },
  { id: 'frenzied', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite frenzied.png' },
  { id: 'health-synergy', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite health-synergy.png' },
  { id: 'life-boost', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite life-boost.png' },
  { id: 'luck-of-the-sea', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite luck-of-the-sea.png' },
  { id: 'lucky-explorer', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite lucky-explorer.png' },
  { id: 'potion-barrier', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite potion-barrier.png' },
  { id: 'reckless', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite reckless.png' },
  { id: 'recycler', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite recycler.png' },
  { id: 'rush', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite rush.png' },
  { id: 'shadow-blast', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shadow-blast.png' },
  { id: 'shadow-surge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shadow-surge.png' },
  { id: 'snowball', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite snowball.png' },
  { id: 'soul-speed', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite soul-speed.png' },
  { id: 'speed-synergy', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite speed-synergy.png' },
  { id: 'surprise-gift', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite surprise-gift.png' },
  { id: 'swiftfooted', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite swiftfooted.png' },
  { id: 'thorns', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite thorns.png' },
  { id: 'tumblebee', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite tumblebee.png' },
  { id: 'chilling', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite chilling.png' },
  { id: 'death-barter', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite death-barter.png' },
  { id: 'final-shout', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite final-shout.png' },
  { id: 'fire-focus', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite fire-focus.png' },
  { id: 'gravity-pulse', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite gravity-pulse.png' },
  { id: 'lightning-focus', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite lightning-focus.png' },
  { id: 'multi-roll', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite multi-roll.png' },
  { id: 'poison-focus', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite poison-focus.png' },
  { id: 'protection', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite protection.png' },
  { id: 'soul-focus', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite soul-focus.png' },
  { id: 'rushdown', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite rushdown.png' },
  { id: 'shared-pain', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shared-pain.png' },
  { id: 'reliable-ricochet', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite reliable-ricochet.png' },
  { id: 'shadow-shot', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shadow-shot.png' },
  { id: 'wind-bow-enchantment', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite wind-bow-(enchantment).png' },
  { id: 'emerald-shield', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite emerald-shield.png' },
  { id: 'environmental-protection', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite environmental-protection.png' },
  { id: 'thrive-under-pressure', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite thrive-under-pressure.png' },
  { id: 'jungle-poison', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite jungle-poison.png' },
  { id: 'knockback', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite knockback.png' },
  { id: 'barrier', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite barrier.png' },
  { id: 'heals-allies', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite heals-allies.png' },
  { id: 'regeneration', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite regeneration.png' },
  { id: 'shielding', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shielding.png' },
  { id: 'shadow-barb', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite shadow-barb.png' },
  { id: 'withering', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite withering.png' },
  { id: 'bows-boon', page: 'Dungeons:Enchantment', fileTitle: "File:DungeonsEnchantmentSprite bow's-boon.png" },
  { id: 'dolphins-grace', page: 'Dungeons:Enchantment', fileTitle: "File:DungeonsEnchantmentSprite dolphin's-grace.png" },
  { id: 'synergy', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite synergy.png' },
  { id: 'invisible', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite invisible.png' },
  { id: 'decal-trail', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite decal-trail.png' },
  { id: 'huge', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite huge.png' },
  { id: 'mob-resurrection-aura', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite mob-resurrection-aura.png' },
  { id: 'double-damage', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite double-damage.png' },
  { id: 'fast-attack', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite fast-attack.png' },
  { id: 'quick', page: 'Dungeons:Enchantment', fileTitle: 'File:DungeonsEnchantmentSprite quick.png' },
  { id: 'anchor', page: 'Dungeons:Anchor', fileTitle: 'File:MCD_Anchor.png' },
  { id: 'axe', page: 'Dungeons:Axe', fileTitle: 'File:MCD_Axe.png' },
  { id: 'backstabber', page: 'Dungeons:Backstabber', fileTitle: 'File:MCD_Backstabber.png' },
  { id: 'battlestaff', page: 'Dungeons:Battlestaff', fileTitle: 'File:MCD_Battlestaff.png' },
  { id: 'boneclub', page: 'Dungeons:Boneclub', fileTitle: 'File:MCD_Boneclub.png' },
  { id: 'broken-sawblade', page: 'Dungeons:Broken Sawblade', fileTitle: 'File:MCD_Broken_Sawblade.png' },
  { id: 'sword', page: 'Dungeons:Sword', fileTitle: 'File:MCD Sword.png' },
  { id: 'claymore', page: 'Dungeons:Claymore', fileTitle: 'File:MCD_Claymore.png' },
  { id: 'coral-blade', page: 'Dungeons:Coral Blade', fileTitle: 'File:MCD_Coral_Blade.png' },
  { id: 'cutlass', page: 'Dungeons:Cutlass', fileTitle: 'File:MCD_Cutlass.png' },
  { id: 'daggers', page: 'Dungeons:Daggers', fileTitle: 'File:MCD_Daggers.png' },
  { id: 'double-axe', page: 'Dungeons:Double Axe', fileTitle: 'File:MCD_Double_Axe.png' },
  { id: 'diamond-sword', page: 'Dungeons:Diamond Sword', fileTitle: 'File:Diamond Sword (MCD).png' },
  { id: 'death-cap-mushroom', page: 'Dungeons:Death Cap Mushroom', fileTitle: 'File:Death Cap Mushroom (MCD).png' },
  { id: 'gauntlets', page: 'Dungeons:Gauntlets', fileTitle: 'File:MCD_Gauntlets.png' },
  { id: 'glaive', page: 'Dungeons:Glaive', fileTitle: 'File:MCD_Glaive.png' },
  { id: 'great-hammer', page: 'Dungeons:Great Hammer', fileTitle: 'File:MCD_Great_Hammer.png' },
  { id: 'bow', page: 'Dungeons:Bow', fileTitle: 'File:MCD_Bow.png' },
  { id: 'hunters-armor', page: "Dungeons:Hunter's Armor", fileTitle: "File:MCD_Hunter's_Armor.png" },
  { id: 'katana', page: 'Dungeons:Katana', fileTitle: 'File:MCD_Katana.png' },
  { id: 'mace', page: 'Dungeons:Mace', fileTitle: 'File:MCD_Mace.png' },
  { id: 'mystery-banner', page: 'Dungeons:Mystery Banner', fileTitle: 'File:Mystery Captain Banner.png' },
  { id: 'obsidian-claymore', page: 'Dungeons:Obsidian Claymore', fileTitle: 'File:MCD_Obsidian_Claymore.png' },
  { id: 'pickaxe', page: 'Dungeons:Pickaxe', fileTitle: 'File:MCD_Pickaxe.png' },
  { id: 'rapier', page: 'Dungeons:Rapier', fileTitle: 'File:MCD_Rapier.png' },
  { id: 'sharpness', page: 'Dungeons:Sharpness', fileTitle: 'File:Sharpness.png' },
  { id: 'sickles', page: 'Dungeons:Sickles', fileTitle: 'File:MCD_Sickles.png' },
  { id: 'soul-knife', page: 'Dungeons:Soul Knife', fileTitle: 'File:MCD_Soul_Knife.png' },
  { id: 'soul-scythe', page: 'Dungeons:Soul Scythe', fileTitle: 'File:MCD_Soul_Scythe.png' },
  { id: 'spear', page: 'Dungeons:Spear', fileTitle: 'File:MCD_Spear.png' },
  { id: 'swirling', page: 'Dungeons:Swirling', fileTitle: 'File:T_Swirling_Icon.png' },
  { id: 'tempest-knife', page: 'Dungeons:Tempest Knife', fileTitle: 'File:MCD_Tempest_Knife.png' },
  { id: 'tnt', page: 'Dungeons:TNT', fileTitle: 'File:TNT (Dungeons).png' },
  { id: 'void-touched-blades', page: 'Dungeons:Void Touched Blades', fileTitle: 'File:MCD_Void_Touched_Blades.png' },
  { id: 'whip', page: 'Dungeons:Whip', fileTitle: 'File:MCD_Whip.png' },
  {
    id: 'regular-bullet',
    page: 'Dungeons:Weapon',
    fileTitle: 'File:DungeonsMiscellaneousSprite regular-bullet.png',
  },
  {
    id: 'unique-bullet',
    page: 'Dungeons:Diamond Sword',
    fileTitle: 'File:DungeonsMiscellaneousSprite unique-bullet.png',
  },
  {
    id: 'wiki-placeholder',
    page: 'Template:DungeonsMiscellaneousSprite',
    fileTitle: 'File:DungeonsMiscellaneousSprite ?.png',
  },
  { id: "apple", page: "Dungeons:Apple", fileTitle: "File:MCD_Apple_(inventory_icon).png" },
  { id: "arrow-bundle", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite arrow-bundle.png" },
  { id: "blast-fungus", page: "Dungeons:Blast Fungus", fileTitle: "File:MCD_Blast_Fungus.png" },
  { id: "boots-of-swiftness", page: "Dungeons:Boots of Swiftness", fileTitle: "File:MCD_Boots_of_Swiftness.png" },
  { id: "bread", page: "Dungeons:Bread", fileTitle: "File:MCD_Bread_(inventory_icon).png" },
  { id: "burning-brew", page: "Dungeons:Burning Brew", fileTitle: "File:MCD_Burning_Brew.png" },
  { id: "buzzy-nest", page: "Dungeons:Buzzy Nest", fileTitle: "File:MCD_Buzzy_Nest.png" },
  { id: "chorus-fruit", page: "Dungeons:Chorus Fruit", fileTitle: "File:MCD_Chorus_Fruit.png" },
  { id: "conduit", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite conduit.png" },
  { id: "cooked-salmon", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite cooked-salmon.png" },
  { id: "corrupted-beacon", page: "Dungeons:Corrupted Beacon", fileTitle: "File:MCD_Corrupted_Beacon.png" },
  { id: "corrupted-pumpkin", page: "Dungeons:Corrupted Pumpkin", fileTitle: "File:MCD_Corrupted_Pumpkin.png" },
  { id: "corrupted-seeds", page: "Dungeons:Corrupted Seeds", fileTitle: "File:MCD_Corrupted_Seeds.png" },
  { id: "dense-brew", page: "Dungeons:Dense Brew", fileTitle: "File:MCD_Dense_Brew.png" },
  { id: "dried-kelp", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite dried-kelp.png" },
  { id: "elytra", page: "Dungeons:Elytra", fileTitle: "File:MCD_Elytra.png" },
  { id: "enchanted-grass", page: "Dungeons:Enchanted Grass", fileTitle: "File:MCD_Enchanted_Grass.png" },
  { id: "enchanters-tome", page: "Dungeons:Enchanter's Tome", fileTitle: "File:MCD_Enchanter's_Tome.png" },
  { id: "eye-of-ender", page: "Dungeons:Eye of Ender", fileTitle: "File:Eye_of_Ender_(Dungeons).png" },
  { id: "eye-of-the-guardian", page: "Dungeons:Eye of the Guardian", fileTitle: "File:MCD_Eye_of_the_Guardian.png" },
  { id: "fireworks-arrow", page: "Dungeons:Fireworks Arrow", fileTitle: "File:MCD_Fireworks_Arrow.png" },
  { id: "fishing-rod", page: "Dungeons:Fishing Rod", fileTitle: "File:MCD_Fishing_Rod.png" },
  { id: "flaming-quiver", page: "Dungeons:Flaming Quiver", fileTitle: "File:MCD_Flaming_Quiver.png" },
  { id: "ghost-cloak", page: "Dungeons:Ghost Cloak", fileTitle: "File:MCD_Ghost_Cloak.png" },
  { id: "golem-kit", page: "Dungeons:Golem Kit", fileTitle: "File:MCD_Golem_Kit.png" },
  { id: "gong-of-weakening", page: "Dungeons:Gong of Weakening", fileTitle: "File:MCD_Gong_of_Weakening.png" },
  { id: "harpoon-quiver", page: "Dungeons:Harpoon Quiver", fileTitle: "File:MCD_Harpoon_Quiver.png" },
  { id: "harvester", page: "Dungeons:Harvester", fileTitle: "File:MCD_Harvester.png" },
  { id: "health-potion-consumable", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite health-potion-(consumable).png" },
  { id: "ice-wand", page: "Dungeons:Ice Wand", fileTitle: "File:MCD_Ice_Wand.png" },
  { id: "icon-map", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite icon-map.png" },
  { id: "iron-hide-amulet", page: "Dungeons:Iron Hide Amulet", fileTitle: "File:MCD_Iron_Hide_Amulet.png" },
  { id: "light-feather", page: "Dungeons:Light Feather", fileTitle: "File:MCD_Light_Feather.png" },
  { id: "lightning-rod", page: "Dungeons:Lightning Rod", fileTitle: "File:MCD_Lightning_Rod.png" },
  { id: "love-medallion", page: "Dungeons:Love Medallion", fileTitle: "File:MCD_Love_Medallion.png" },
  { id: "melon", page: "Dungeons:Melon", fileTitle: "File:MCD_Melon_(inventory_icon).png" },
  { id: "oakwood-brew", page: "Dungeons:Oakwood Brew", fileTitle: "File:MCD_Oakwood_Brew.png" },
  { id: "pork", page: "Dungeons:Pork", fileTitle: "File:MCD_Pork_(inventory_icon).png" },
  { id: "potion-of-water-breathing", page: "Dungeons:Potion of Water Breathing", fileTitle: "File:MCD_Potion_of_Water_Breathing.png" },
  { id: "powershaker", page: "Dungeons:Powershaker", fileTitle: "File:MCD_Powershaker.png" },
  { id: "satchel-of-elements", page: "Dungeons:Satchel of Elements", fileTitle: "File:MCD_Satchel_of_Elements.png" },
  { id: "satchel-of-elixirs", page: "Dungeons:Satchel of Elixirs", fileTitle: "File:MCD_Satchel_of_Elixirs.png" },
  { id: "satchel-of-snacks", page: "Dungeons:Satchel of Snacks", fileTitle: "File:MCD_Satchel_of_Snacks.png" },
  { id: "scatter-mines", page: "Dungeons:Scatter Mines", fileTitle: "File:MCD_Scatter_Mines.png" },
  { id: "shadow-brew", page: "Dungeons:Shadow Brew", fileTitle: "File:MCD_Shadow_Brew.png" },
  { id: "shadow-shifter", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite shadow-shifter.png" },
  { id: "shock-powder", page: "Dungeons:Shock Powder", fileTitle: "File:MCD_Shock_Powder.png" },
  { id: "soul-healer", page: "Dungeons:Soul Healer", fileTitle: "File:MCD_Soul_Healer.png" },
  { id: "soul-lantern", page: "Dungeons:Soul Lantern", fileTitle: "File:MCD_Soul_Lantern.png" },
  { id: "spinblade", page: "Dungeons:Spinblade", fileTitle: "File:MCD_Spinblade.png" },
  { id: "strength-potion", page: "Dungeons:Strength Potion", fileTitle: "File:MCD_Strength_Potion.png" },
  { id: "sweet-berries", page: "Dungeons:Sweet Berries", fileTitle: "File:MCD_Sweet_Berries_(inventory_icon).png" },
  { id: "sweet-brew", page: "Dungeons:Sweet Brew", fileTitle: "File:MCD_Sweet_Brew.png" },
  { id: "swiftness-potion", page: "Dungeons:Swiftness Potion", fileTitle: "File:MCD_Swiftness_Potion.png" },
  { id: "tasty-bone", page: "Dungeons:Tasty Bone", fileTitle: "File:MCD_Tasty_Bone.png" },
  { id: "threat-banner", page: "Template:DungeonsItemSprite", fileTitle: "File:DungeonsItemSprite threat-banner.png" },
  { id: "thundering-quiver", page: "Dungeons:Thundering Quiver", fileTitle: "File:MCD_Thundering_Quiver.png" },
  { id: "tome-of-duplication", page: "Dungeons:Tome of Duplication", fileTitle: "File:MCD_Tome_of_Duplication.png" },
  { id: "torment-quiver", page: "Dungeons:Torment Quiver", fileTitle: "File:MCD_Torment_Quiver.png" },
  { id: "totem-of-casting", page: "Dungeons:Totem of Casting", fileTitle: "File:MCD_Totem_of_Casting.png" },
  { id: "totem-of-regeneration", page: "Dungeons:Totem of Regeneration", fileTitle: "File:MCD_Totem_of_Regeneration.png" },
  { id: "totem-of-shielding", page: "Dungeons:Totem of Shielding", fileTitle: "File:MCD_Totem_of_Shielding.png" },
  { id: "totem-of-soul-protection", page: "Dungeons:Totem of Soul Protection", fileTitle: "File:MCD_Totem_of_Soul_Protection.png" },
  { id: "trident", page: "Dungeons:Trident", fileTitle: "File:MCD_Trident.png" },
  { id: "tropical-fish", page: "Dungeons:Tropical Fish", fileTitle: "File:MCD_Tropical_Fish_(item).png" },
  { id: "updraft-tome", page: "Dungeons:Updraft Tome", fileTitle: "File:MCD_Updraft_Tome.png" },
  { id: "vexing-chant", page: "Dungeons:Vexing Chant", fileTitle: "File:MCD_Vexing_Chant.png" },
  { id: "void-quiver", page: "Dungeons:Void Quiver", fileTitle: "File:Void_Quiver_(MCD).png" },
  { id: "wind-horn", page: "Dungeons:Wind Horn", fileTitle: "File:MCD_Wind_Horn.png" },
  { id: "wonderful-wheat", page: "Dungeons:Wonderful Wheat", fileTitle: "File:MCD_Wonderful_Wheat.png" },
];

function pageUrl(pageTitle) {
  const encodedTitle = encodeURIComponent(pageTitle.replaceAll(' ', '_'));
  return new URL('/w/' + encodedTitle, WIKI_ORIGIN).toString();
}

function filePageUrl(fileTitle) {
  const encodedTitle = encodeURIComponent(fileTitle.replaceAll(' ', '_'));
  return new URL('/w/' + encodedTitle, WIKI_ORIGIN).toString();
}

function normalizeTitle(title) {
  return title.replace(/^File:/i, '').replaceAll('_', ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en-US');
}

function apiRequestUrl(parameters) {
  const url = new URL(API_URL);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  return url;
}

async function readApiJson(parameters) {
  const url = apiRequestUrl(parameters);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error('Wiki API returned HTTP ' + response.status + ' for ' + url.pathname + '. Response: ' + body.slice(0, 240));
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Wiki API did not return JSON for ' + url.pathname + '. Response: ' + body.slice(0, 240));
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error('Wiki API returned invalid JSON for ' + url.pathname, { cause: error });
  }
  if (data.error) {
    throw new Error('Wiki API error ' + data.error.code + ': ' + data.error.info);
  }
  return data;
}

async function findPageImage(entry) {
  const wanted = normalizeTitle(entry.fileTitle);
  let continuation;
  let checkedImages = 0;
  for (let pageNumber = 0; pageNumber < 100; pageNumber += 1) {
    const data = await readApiJson({
      action: 'query',
      format: 'json',
      imlimit: 'max',
      prop: 'images',
      titles: entry.page,
      ...continuation,
    });
    const pages = Object.values(data.query?.pages ?? {});
    const page = pages.find((candidate) => !candidate.missing);
    if (!page) throw new Error('Wiki article is missing: ' + entry.page);

    const pageImages = (page.images ?? []).map((image) => image.title);
    const match = pageImages.find((title) => normalizeTitle(title) === wanted);
    if (match) return match;

    checkedImages += pageImages.length;
    continuation = data.continue;
    if (!continuation) break;
    if (pageNumber === 99) {
      throw new Error('Wiki image lookup exceeded 100 continuation pages for ' + entry.page + '.');
    }
  }

  throw new Error('Expected file ' + entry.fileTitle + ' is no longer embedded on ' + entry.page + '. Checked ' + checkedImages + ' images.');
}

async function loadCurrentFileInfo(fileTitles) {
  const result = new Map();

  for (let offset = 0; offset < fileTitles.length; offset += 50) {
    const titles = fileTitles.slice(offset, offset + 50);
    const data = await readApiJson({
      action: 'query',
      format: 'json',
      iiprop: 'url|timestamp|sha1|size|mime',
      prop: 'imageinfo',
      titles: titles.join('|'),
    });
    const pages = Object.values(data.query?.pages ?? {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (page.missing || !info?.url) throw new Error('Wiki file is missing or has no original URL: ' + page.title);
      result.set(normalizeTitle(page.title), { title: page.title, ...info });
    }
  }
  return result;
}

async function downloadPng(info) {
  const url = new URL(info.url);
  if (url.protocol !== 'https:' || url.origin !== WIKI_ORIGIN || !url.pathname.startsWith('/images/')) {
    throw new Error('Refusing an unexpected Wiki file host or path: ' + info.url);
  }

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error('Image download returned HTTP ' + response.status + ' for ' + info.title);

  const mime = response.headers.get('content-type')?.split(';', 1)[0].trim().toLocaleLowerCase('en-US');
  if (mime !== 'image/png' || info.mime !== 'image/png') {
    throw new Error('Expected a PNG for ' + info.title + ', received ' + (mime ?? 'unknown MIME type'));
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) {
    throw new Error('Unexpected image size for ' + info.title + ': ' + bytes.length + ' bytes');
  }
  if (!bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('Downloaded content is not a PNG file: ' + info.title);
  }
  return bytes;
}

function getArguments() {
  const args = process.argv.slice(2);
  const unknown = args.filter((arg) => arg !== '--dry-run');
  if (unknown.length) throw new Error('Unknown argument: ' + unknown.join(' '));
  return { dryRun: args.includes('--dry-run') };
}

async function main() {
  const { dryRun } = getArguments();
  const resolvedEntries = sourceEntries.map((entry) => {
    const asset = iconAssets[entry.id];
    if (!asset) throw new Error('Icon ID is not registered: ' + entry.id);
    if (path.basename(asset.file) !== asset.file || path.extname(asset.file).toLocaleLowerCase('en-US') !== '.png') {
      throw new Error('Expected a registered PNG basename for ' + entry.id + ', received ' + asset.file);
    }
    return { ...entry, outputFile: asset.file };
  });

  const verifiedTitles = [];
  for (const entry of resolvedEntries) verifiedTitles.push(await findPageImage(entry));

  const infoByTitle = await loadCurrentFileInfo([...new Set(verifiedTitles)]);
  const records = [];
  const payloads = [];
  for (let index = 0; index < resolvedEntries.length; index += 1) {
    const entry = resolvedEntries[index];
    const title = verifiedTitles[index];
    const info = infoByTitle.get(normalizeTitle(title));
    if (!info) throw new Error('Wiki API did not return image info for ' + title);

    const downloaded = dryRun ? null : await downloadPng(info);
    const record = {
      id: entry.id,
      sourcePage: pageUrl(entry.page),
      wikiFilePage: info.descriptionurl || filePageUrl(title),
      wikiFileTitle: title,
      uploadedAt: info.timestamp,
      wikiSha1: info.sha1,
      wikiBytes: info.size,
      wikiMime: info.mime,
      ...(downloaded && {
        downloadedSha1: createHash('sha1').update(downloaded).digest('hex'),
        downloadedBytes: downloaded.length,
        downloadedMime: 'image/png',
      }),
      localFile: 'assets/' + entry.outputFile,
    };
    records.push(record);
    if (downloaded) payloads.push({ record, bytes: downloaded });
  }

  const manifest = {
    wiki: 'Minecraft Wiki',
    api: API_URL.toString(),
    syncedAt: new Date().toISOString(),
    assets: records,
  };

  if (dryRun) {
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  const assetDir = path.join(ROOT, 'assets');
  const manifestPath = path.join(ROOT, 'docs', 'wiki-icon-sync.json');
  await mkdir(assetDir, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const stagingDir = await mkdtemp(path.join(ROOT, '.wiki-icon-sync-'));
  try {
    for (const { record, bytes } of payloads) {
      await writeFile(path.join(stagingDir, path.basename(record.localFile)), bytes);
    }
    await writeFile(path.join(stagingDir, 'wiki-icon-sync.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    for (const { record } of payloads) {
      const destination = path.join(assetDir, path.basename(record.localFile));
      await rename(path.join(stagingDir, path.basename(record.localFile)), destination);
    }
    await rename(path.join(stagingDir, 'wiki-icon-sync.json'), manifestPath);
  } finally {
    await rm(stagingDir, { recursive: true, force: true });
  }

  console.log('Synchronized ' + payloads.length + ' Wiki icons.');
  for (const { record, bytes } of payloads) {
    console.log(record.id + ': ' + record.wikiFileTitle + ' -> ' + record.localFile + ' (' + bytes.length + ' bytes)');
  }
  console.log('Source record: docs/wiki-icon-sync.json');
}

main().catch((error) => {
  console.error('Wiki icon sync failed: ' + (error.stack ?? error));
  process.exitCode = 1;
});
