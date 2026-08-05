export type Partner = "sasha" | "marina";

export type MemoryCategory =
  | "love"
  | "pain"
  | "support"
  | "values"
  | "agreements"
  | "good";

export type Profile = {
  id: Partner;
  name: string;
  createdAt: string;
};

export type Memory = {
  id: string;
  owner: Partner;
  category: MemoryCategory;
  text: string;
  createdAt: string;
};

export type ConflictEntry = {
  id: string;
  owner: Partner;
  partner: Partner;
  hurt: string;
  angryBecause: string;
  aiAnswer: string;
  createdAt: string;
};

export type AppState = {
  profiles: Partial<Record<Partner, Profile>>;
  memories: Memory[];
  entries: ConflictEntry[];
};

export const people: Record<Partner, { name: string; partner: Partner }> = {
  sasha: { name: "Саша", partner: "marina" },
  marina: { name: "Марина", partner: "sasha" },
};

export const categoryLabels: Record<MemoryCategory, string> = {
  love: "як любить",
  pain: "що ранить",
  support: "слова підтримки",
  values: "цінності",
  agreements: "домовленості",
  good: "теплі моменти",
};

export const emptyState: AppState = {
  profiles: {},
  memories: [],
  entries: [],
};
