CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  username        TEXT UNIQUE,
  steam_id        TEXT UNIQUE,
  steam_linked_at TIMESTAMPTZ,
  steam_synced_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steam_appid  INTEGER UNIQUE,
  title        TEXT NOT NULL,
  genres       TEXT[] NOT NULL DEFAULT '{}',
  platforms    TEXT[] NOT NULL DEFAULT '{}',
  release_year INTEGER,
  developer    TEXT,
  cover_url    TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS steam_owned_games (
  user_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steam_appid      INTEGER NOT NULL,
  playtime_minutes INTEGER NOT NULL DEFAULT 0,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, steam_appid)
);

CREATE TABLE IF NOT EXISTS library_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id            UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  status             TEXT NOT NULL CHECK (status IN ('playing', 'finished', 'dropped', 'on_hold', 'backlog')),
  rating             SMALLINT CHECK (rating BETWEEN 1 AND 10),
  hours_played       NUMERIC(7,1),
  review             TEXT,
  ownership_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at        TIMESTAMPTZ,
  started_at         DATE,
  finished_at        DATE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id)
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_library_user ON library_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_library_game ON library_entries(game_id);
CREATE INDEX IF NOT EXISTS idx_library_rating ON library_entries(game_id, rating);
CREATE INDEX IF NOT EXISTS idx_games_appid ON games(steam_appid);
