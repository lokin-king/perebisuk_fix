import { generateAiAnswer } from "@/lib/ai";
import { getRuntimeEnv } from "@/lib/cloudflare";
import { deleteEntry, ensureSchema, insertEntry, isPartner, readAllMemories, readState } from "@/lib/db";
import { sendTelegram } from "@/lib/telegram";
import { ConflictEntry, people } from "@/lib/types";

export async function POST(request: Request) {
  const env = await getRuntimeEnv();
  const body = (await request.json().catch(() => ({}))) as {
    owner?: unknown;
    hurt?: unknown;
    angryBecause?: unknown;
  };

  if (!env.DB) {
    return Response.json({ ok: false, error: "Потрібно підключити Cloudflare D1 database." }, { status: 503 });
  }

  if (!isPartner(body.owner)) {
    return Response.json({ ok: false, error: "Некоректний користувач." }, { status: 400 });
  }

  if (typeof body.hurt !== "string" || typeof body.angryBecause !== "string") {
    return Response.json({ ok: false, error: "Заповни обидва поля." }, { status: 400 });
  }

  const hurt = body.hurt.trim();
  const angryBecause = body.angryBecause.trim();
  if (!hurt || !angryBecause) {
    return Response.json({ ok: false, error: "Заповни обидва поля." }, { status: 400 });
  }

  await ensureSchema(env.DB);

  const partner = people[body.owner].partner;
  const memories = await readAllMemories(env.DB);
  const draft = { owner: body.owner, partner, hurt, angryBecause };
  const aiAnswer = await generateAiAnswer(env, draft, memories);

  const entry: ConflictEntry = {
    ...draft,
    id: crypto.randomUUID(),
    aiAnswer,
    createdAt: new Date().toISOString(),
  };

  await insertEntry(env.DB, entry);
  await sendTelegram(
    env,
    [
      "пребісюк: новий запис",
      `хто: ${people[entry.owner].name}`,
      `коли: ${entry.createdAt}`,
      "",
      "образило:",
      entry.hurt,
      "",
      "чому злий/зла:",
      entry.angryBecause,
      "",
      "відповідь AI:",
      entry.aiAnswer,
    ].join("\n"),
  );

  const state = await readState(env.DB, entry.owner);
  return Response.json({ ok: true, state, entry });
}

export async function DELETE(request: Request) {
  const env = await getRuntimeEnv();
  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    owner?: unknown;
  };

  if (!env.DB) {
    return Response.json({ ok: false, error: "Потрібно підключити Cloudflare D1 database." }, { status: 503 });
  }

  if (!isPartner(body.owner)) {
    return Response.json({ ok: false, error: "Некоректний користувач." }, { status: 400 });
  }

  if (typeof body.id !== "string" || !body.id.trim()) {
    return Response.json({ ok: false, error: "Некоректний запис." }, { status: 400 });
  }

  await ensureSchema(env.DB);
  await deleteEntry(env.DB, body.id, body.owner);

  const state = await readState(env.DB, body.owner);
  return Response.json({ ok: true, state });
}
