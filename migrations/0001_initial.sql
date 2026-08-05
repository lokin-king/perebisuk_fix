CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS conflict_entries (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  hurt TEXT NOT NULL,
  angry_because TEXT NOT NULL,
  ai_answer TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES profiles(id),
  FOREIGN KEY (partner_id) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_memories_owner ON memories(owner_id);
CREATE INDEX IF NOT EXISTS idx_entries_owner ON conflict_entries(owner_id, created_at DESC);
