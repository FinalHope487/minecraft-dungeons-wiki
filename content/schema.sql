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

CREATE TABLE entry_links (
  id INTEGER PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  target_entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE RESTRICT,
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (entry_id, position)
);

CREATE TABLE entry_link_translations (
  link_id INTEGER NOT NULL REFERENCES entry_links(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('zh-Hant', 'en')),
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  PRIMARY KEY (link_id, language)
);

CREATE TABLE entry_built_in_enchantments (
  link_id INTEGER PRIMARY KEY REFERENCES entry_links(id) ON DELETE CASCADE,
  property_icon TEXT NOT NULL CHECK (property_icon IN ('regular-bullet', 'unique-bullet')),
  tier INTEGER CHECK (tier IS NULL OR tier BETWEEN 1 AND 3)
);

CREATE TABLE entry_sources (
  id INTEGER PRIMARY KEY,
  entry_id TEXT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (length(trim(label)) > 0),
  url TEXT NOT NULL CHECK (substr(url, 1, 8) = 'https://'),
  position INTEGER NOT NULL CHECK (position >= 0),
  UNIQUE (entry_id, position)
);

CREATE INDEX entries_by_category ON entries(category_id, position);
CREATE INDEX facts_by_entry ON facts(entry_id, position);
CREATE INDEX traits_by_entry ON traits(entry_id, position);
CREATE INDEX links_by_entry ON entry_links(entry_id, position);
CREATE INDEX sources_by_entry ON entry_sources(entry_id, position);

PRAGMA user_version = 4;

COMMIT;
