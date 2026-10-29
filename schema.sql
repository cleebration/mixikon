CREATE TABLE IF NOT EXISTS vorschlag (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wort TEXT NOT NULL,
  wort_norm TEXT NOT NULL UNIQUE,
  wort1 TEXT NOT NULL,
  wort2 TEXT NOT NULL,
  bedeutung TEXT,
  sprache TEXT NOT NULL DEFAULT 'de',
  status TEXT NOT NULL DEFAULT 'eingereicht' CHECK (status IN ('eingereicht','live','abgelehnt')),
  merch INTEGER NOT NULL DEFAULT 0,
  stimmen INTEGER NOT NULL DEFAULT 1,
  ip_hash TEXT,
  erstellt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  entschieden TEXT
);
CREATE INDEX IF NOT EXISTS idx_vorschlag_status ON vorschlag(status);
CREATE INDEX IF NOT EXISTS idx_vorschlag_ip ON vorschlag(ip_hash, erstellt);
