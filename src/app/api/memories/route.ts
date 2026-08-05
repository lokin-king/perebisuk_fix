import { getRuntimeEnv } from "@/lib/cloudflare";
import { ensureSchema, insertMemory, isPartner, readState } from "@/lib/db";
import { sendTelegram } from "@/lib/telegram";
import { Memory, MemoryCategory, categoryLabels, people } from "@/lib/types";

const categories = new Set(["love", "pain", "support", "values", "agreements", "good"]);

export async function POST(request: Request) {
  const env = await getRuntimeEnv();
  const body = (await request.json().catch(() => ({}))) as {
    owner?: unknown;
    category?: unknown;
    text?: unknown;
  };

  if (!env.DB) {
    return Response.json({ ok: false, error: "Потрібно підключити Cloudflare D1 database." }, { status: 503 });
  }

  if (!isPartner(body.owner) || typeof body.category !== "string" || !categories.has(body.category)) {
    return Response.json({ ok: false, error: "Некоректна пам'ять." }, { status: 400 });
  }

  if (typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ ok: false, error: "Напиши факт пам'яті." }, { status: 400 });
  }

  await ensureSchema(env.DB);

  const memory: Memory = {
    id: crypto.randomUUID(),
    owner: body.owner,
    category: body.category as MemoryCategory,
    text: body.text.trim(),
    createdAt: new Date().toISOString(),
  };

  await insertMemory(env.DB, memory);
  await sendTelegram(
    env,
    [
      "пребісюк: новий факт пам'яті",
      `хто: ${people[memory.owner].name}`,
      `категорія: ${categoryLabels[memory.category]}`,
      "",
      memory.text,
    ].join("\n"),
  );

  const state = await readState(env.DB, memory.owner);
  return Response.json({ ok: true, state });
}
