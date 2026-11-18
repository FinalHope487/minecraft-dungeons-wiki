-- Executed by tools/migrate-v5-to-v6.mjs against an output copy of schema v5.
-- The caller owns the transaction and populates normalized rows before commit.
PRAGMA foreign_keys = OFF;
BEGIN IMMEDIATE;

ALTER TABLE entries ADD COLUMN description_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (description_status IN ('source', 'placeholder', 'unknown'));
ALTER TABLE facts ADD COLUMN semantic_key TEXT NOT NULL DEFAULT 'unknown'
  CHECK (length(trim(semantic_key)) > 0);
ALTER TABLE facts ADD COLUMN claim_origin TEXT NOT NULL DEFAULT 'unknown'
  CHECK (claim_origin IN ('source', 'inference', 'unknown'));
ALTER TABLE facts ADD COLUMN wiki_status TEXT NOT NULL DEFAULT 'unknown'
  CHECK (wiki_status IN ('unmarked', 'verify', 'unknown'));

CREATE TABLE fact_evidence (
  fact_id INTEGER NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  source_id INTEGER NOT NULL REFERENCES entry_sources(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('context', 'supports', 'conflicts')),
  PRIMARY KEY (fact_id, source_id, relation)
);

CREATE TABLE relation_kinds (
  id TEXT PRIMARY KEY CHECK (id IN ('base_variant', 'weapon_enchantment'))
);
INSERT INTO relation_kinds(id) VALUES ('base_variant'), ('weapon_enchantment');

CREATE TABLE enchantment_effect_profiles (
  entry_id TEXT PRIMARY KEY REFERENCES entries(id) ON DELETE CASCADE,
  player_availability TEXT NOT NULL CHECK (player_availability IN ('available', 'unavailable', 'unknown')),
  mob_availability TEXT NOT NULL CHECK (mob_availability IN ('available', 'unavailable', 'unknown')),
  effect_relation TEXT NOT NULL CHECK (effect_relation IN ('same', 'different', 'unknown')),
  player_fact_id INTEGER REFERENCES facts(id) ON DELETE RESTRICT,
  mob_fact_id INTEGER REFERENCES facts(id) ON DELETE RESTRICT
);

CREATE TABLE entry_relations (
  id INTEGER PRIMARY KEY,
  relation_kind TEXT NOT NULL REFERENCES relation_kinds(id) ON DELETE RESTRICT,
  source_entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  target_entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  CHECK (source_entry_id <> target_entry_id),
  UNIQUE (relation_kind, source_entry_id, target_entry_id)
);

ALTER TABLE entry_built_in_enchantments RENAME TO entry_built_in_enchantments_v5;
ALTER TABLE entry_link_translations RENAME TO entry_link_translations_v5;
ALTER TABLE entry_links RENAME TO entry_links_v5;

CREATE TABLE entry_links (
  id INTEGER PRIMARY KEY,
  relation_id INTEGER NOT NULL REFERENCES entry_relations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('forward', 'reverse')),
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (relation_id, direction)
);

CREATE TABLE relation_type_translations (
  relation_kind TEXT NOT NULL REFERENCES relation_kinds(id) ON DELETE RESTRICT,
  direction TEXT NOT NULL CHECK (direction IN ('forward', 'reverse')),
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  PRIMARY KEY (relation_kind, direction, language)
);

CREATE TABLE entry_built_in_enchantments (
  link_id INTEGER PRIMARY KEY REFERENCES entry_links(id) ON DELETE CASCADE,
  property_icon TEXT NOT NULL CHECK (property_icon IN ('regular-bullet', 'unique-bullet')),
  tier INTEGER CHECK (tier IS NULL OR tier BETWEEN 1 AND 3),
  property_trait_id INTEGER NOT NULL REFERENCES traits(id) ON DELETE RESTRICT
);

CREATE TABLE icon_assets (
  id TEXT PRIMARY KEY,
  file TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  source_page TEXT,
  wiki_file_title TEXT,
  provenance TEXT NOT NULL CHECK (provenance IN ('wiki', 'game', 'unknown'))
);

CREATE TABLE icon_recipes (
  id TEXT PRIMARY KEY,
  base_role TEXT NOT NULL,
  overlay_role TEXT NOT NULL,
  overlay_percent INTEGER NOT NULL CHECK (overlay_percent BETWEEN 1 AND 100),
  frame_style TEXT NOT NULL CHECK (frame_style IN ('none', 'orange'))
);

CREATE INDEX links_by_relation ON entry_links(relation_id, position);
CREATE INDEX relations_by_source ON entry_relations(source_entry_id, relation_kind);
CREATE INDEX relations_by_target ON entry_relations(target_entry_id, relation_kind);
CREATE INDEX fact_evidence_by_source ON fact_evidence(source_id, fact_id);

PRAGMA user_version = 6;
