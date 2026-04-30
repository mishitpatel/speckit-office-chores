PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS person (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS person_name_ci ON person (LOWER(name));

CREATE TABLE IF NOT EXISTS chore (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  assignee_id  TEXT NOT NULL REFERENCES person(id) ON DELETE RESTRICT,
  date         TEXT NOT NULL CHECK (date GLOB '????-??-??'),
  done         INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS chore_date_assignee ON chore (date, assignee_id);
CREATE INDEX IF NOT EXISTS chore_assignee      ON chore (assignee_id);

CREATE TRIGGER IF NOT EXISTS chore_touch_updated_at
AFTER UPDATE ON chore
FOR EACH ROW
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE chore SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
