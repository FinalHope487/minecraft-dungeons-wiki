PRAGMA foreign_keys = ON;

BEGIN;

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  icon TEXT NOT NULL,
  group_key TEXT CHECK (group_key IS NULL OR group_key = 'equipment'),
  position INTEGER NOT NULL UNIQUE CHECK (position >= 0)
);

CREATE TABLE category_translations (
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  PRIMARY KEY (category_id, language)
);

CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  icon TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('steel', 'gold', 'violet')),
  implemented INTEGER NOT NULL DEFAULT 1 CHECK (implemented IN (0, 1)),
  seasonal INTEGER NOT NULL DEFAULT 0 CHECK (seasonal IN (0, 1)),
  description_status TEXT NOT NULL DEFAULT 'unknown' CHECK (description_status IN ('source', 'placeholder', 'unknown')),
  position INTEGER NOT NULL UNIQUE CHECK (position >= 0)
);

CREATE TABLE entry_translations (
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  badge TEXT NOT NULL CHECK (length(trim(badge)) > 0),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  PRIMARY KEY (entry_id, language)
);

CREATE TABLE facts (
  id INTEGER PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  semantic_key TEXT NOT NULL CHECK (length(trim(semantic_key)) > 0),
  claim_origin TEXT NOT NULL CHECK (claim_origin IN ('source', 'inference', 'unknown')),
  wiki_status TEXT NOT NULL CHECK (wiki_status IN ('unmarked', 'verify', 'unknown')),
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (entry_id, position)
);

CREATE TABLE fact_translations (
  fact_id INTEGER NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  value TEXT NOT NULL CHECK (length(trim(value)) > 0),
  PRIMARY KEY (fact_id, language)
);

CREATE TABLE traits (
  id INTEGER PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (entry_id, position)
);

CREATE TABLE trait_translations (
  trait_id INTEGER NOT NULL REFERENCES traits(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  PRIMARY KEY (trait_id, language)
);

CREATE TABLE entry_sources (
  id INTEGER PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  url TEXT NOT NULL CHECK (substr(url, 1, 8) = 'https://'),
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (entry_id, position)
);

CREATE TABLE fact_evidence (
  fact_id INTEGER NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  source_id INTEGER NOT NULL REFERENCES entry_sources(id) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('context', 'supports', 'conflicts')),
  PRIMARY KEY (fact_id, source_id, relation)
);

CREATE TABLE relation_kinds (
  id TEXT PRIMARY KEY CHECK (id IN ('base_variant', 'weapon_enchantment'))
);

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

CREATE INDEX entries_by_category ON entries(category_id, position);
CREATE INDEX facts_by_entry ON facts(entry_id, position);
CREATE INDEX facts_by_semantic_key ON facts(entry_id, semantic_key);
CREATE INDEX traits_by_entry ON traits(entry_id, position);
CREATE INDEX links_by_relation ON entry_links(relation_id, position);
CREATE INDEX relations_by_source ON entry_relations(source_entry_id, relation_kind);
CREATE INDEX relations_by_target ON entry_relations(target_entry_id, relation_kind);
CREATE INDEX sources_by_entry ON entry_sources(entry_id, position);
CREATE INDEX fact_evidence_by_source ON fact_evidence(source_id, fact_id);

PRAGMA user_version = 6;

COMMIT;
