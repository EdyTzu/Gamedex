-- Ruleaza asta DOAR daca ai rulat deja schema fara Steam si ai deja tabelele create.
-- Daca pornesti de la zero, ruleaza direct db/schema.sql, care le contine deja.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS steam_id        TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS steam_linked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS steam_synced_at TIMESTAMPTZ;

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS steam_appid INTEGER UNIQUE;

ALTER TABLE library_entries
  ADD COLUMN IF NOT EXISTS ownership_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verified_at        TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS steam_owned_games (
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_appid      INTEGER NOT NULL,
  playtime_minutes INTEGER NOT NULL DEFAULT 0,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, steam_appid)
);

CREATE INDEX IF NOT EXISTS idx_games_appid ON games(steam_appid);
