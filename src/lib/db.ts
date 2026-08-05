import { D1DatabaseLike } from "./cloudflare";
import { AppState, ConflictEntry, Memory, Partner, people } from "./types";

type ProfileRow = {
  id: Partner;
  name: string;
  password_hash: string;
  created_at: string;
};

type MemoryRow = {
  id: string;
  owner_id: Partner;
  category: Memory["category"];
  text: string;
  created_at: string;
};

type EntryRow = {
  id: string;
  owner_id: Partner;
  partner_id: Partner;
  hurt: string;
  angry_because: string;
  ai_answer: string;
  created_at: string;
};

export async function ensureSchema(db: D1DatabaseLike) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      category TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS conflict_entries (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      partner_id TEXT NOT NULL,
      hurt TEXT NOT NULL,
      angry_because TEXT NOT NULL,
      ai_answer TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    "CREATE INDEX IF NOT EXISTS idx_memories_owner ON memories(owner_id)",
    "CREATE INDEX IF NOT EXISTS idx_entries_owner ON conflict_entries(owner_id, created_at DESC)",
  ];

  for (const statement of statements) {
    await db.prepare(statement).run();
  }
}

export async function hashPassword(user: Partner, password: string) {
  const data = new TextEncoder().encode(`${user}:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getProfile(db: D1DatabaseLike, user: Partner) {
  return db.prepare("SELECT * FROM profiles WHERE id = ?").bind(user).first<ProfileRow>();
}

export async function createProfile(db: D1DatabaseLike, user: Partner, passwordHash: string) {
  await db
    .prepare("INSERT INTO profiles (id, name, password_hash, created_at) VALUES (?, ?, ?, ?)")
    .bind(user, people[user].name, passwordHash, new Date().toISOString())
    .run();
}

export async function verifyOrCreateProfile(db: D1DatabaseLike, user: Partner, password: string) {
  const passwordHash = await hashPassword(user, password);
  const profile = await getProfile(db, user);

  if (!profile) {
    await createProfile(db, user, passwordHash);
    return true;
  }

  return profile.password_hash === passwordHash;
}

export async function readState(db: D1DatabaseLike, user?: Partner): Promise<AppState> {
  const profilesResult = await db.prepare("SELECT id, name, created_at FROM profiles").all<ProfileRow>();
  const memoriesResult = user
    ? await db
        .prepare("SELECT * FROM memories WHERE owner_id = ? ORDER BY created_at ASC")
        .bind(user)
        .all<MemoryRow>()
    : { results: [] };
  const entriesResult = user
    ? await db
        .prepare("SELECT * FROM conflict_entries WHERE owner_id = ? ORDER BY created_at DESC")
        .bind(user)
        .all<EntryRow>()
    : { results: [] };

  const profiles: AppState["profiles"] = {};
  for (const row of profilesResult.results ?? []) {
    profiles[row.id] = {
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
    };
  }

  return {
    profiles,
    memories: (memoriesResult.results ?? []).map(toMemory),
    entries: (entriesResult.results ?? []).map(toEntry),
  };
}

export async function readAllMemories(db: D1DatabaseLike) {
  const result = await db.prepare("SELECT * FROM memories ORDER BY created_at ASC").all<MemoryRow>();
  return (result.results ?? []).map(toMemory);
}

export async function insertMemory(db: D1DatabaseLike, memory: Memory) {
  await db
    .prepare("INSERT INTO memories (id, owner_id, category, text, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(memory.id, memory.owner, memory.category, memory.text, memory.createdAt)
    .run();
}

export async function insertEntry(db: D1DatabaseLike, entry: ConflictEntry) {
  await db
    .prepare(
      "INSERT INTO conflict_entries (id, owner_id, partner_id, hurt, angry_because, ai_answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(entry.id, entry.owner, entry.partner, entry.hurt, entry.angryBecause, entry.aiAnswer, entry.createdAt)
    .run();
}

function toMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    owner: row.owner_id,
    category: row.category,
    text: row.text,
    createdAt: row.created_at,
  };
}

function toEntry(row: EntryRow): ConflictEntry {
  return {
    id: row.id,
    owner: row.owner_id,
    partner: row.partner_id,
    hurt: row.hurt,
    angryBecause: row.angry_because,
    aiAnswer: row.ai_answer,
    createdAt: row.created_at,
  };
}

export function isPartner(value: unknown): value is Partner {
  return value === "sasha" || value === "marina";
}
