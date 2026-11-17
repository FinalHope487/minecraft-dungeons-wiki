PRAGMA foreign_keys = ON;

BEGIN;

ALTER TABLE entry_built_in_enchantments RENAME TO entry_built_in_enchantments_v4;

CREATE TABLE entry_built_in_enchantments (
  link_id INTEGER PRIMARY KEY REFERENCES entry_links(id) ON DELETE CASCADE,
  property_icon TEXT NOT NULL CHECK (property_icon IN ('regular-bullet', 'unique-bullet')),
  tier INTEGER CHECK (tier IS NULL OR tier BETWEEN 1 AND 3),
  property_trait_id INTEGER NOT NULL REFERENCES traits(id) ON DELETE RESTRICT
);

INSERT INTO entry_built_in_enchantments (link_id, property_icon, tier, property_trait_id)
SELECT old.link_id,
  old.property_icon,
  old.tier,
  CASE
    WHEN source.entry_id IN ('anchor', 'encrusted-anchor') AND target.id = 'gravity' THEN (
      SELECT trait.id FROM traits AS trait
      WHERE trait.entry_id = source.entry_id AND trait.position = 2
    )
    ELSE (
      SELECT trait.id FROM traits AS trait
      WHERE trait.entry_id = source.entry_id AND trait.icon = old.property_icon
      ORDER BY trait.position LIMIT 1
    )
  END
FROM entry_built_in_enchantments_v4 AS old
JOIN entry_links AS source ON source.id = old.link_id
JOIN entries AS target ON target.id = source.target_entry_id;

DROP TABLE entry_built_in_enchantments_v4;

PRAGMA user_version = 5;

COMMIT;
