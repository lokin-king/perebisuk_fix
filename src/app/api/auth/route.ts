import { getRuntimeEnv } from "@/lib/cloudflare";
import { ensureSchema, isPartner, readState, verifyOrCreateProfile } from "@/lib/db";

export async function POST(request: Request) {
  const env = await getRuntimeEnv();
  const body = (await request.json().catch(() => ({}))) as {
    user?: unknown;
    password?: unknown;
  };

  if (!env.DB) {
    return Response.json({ ok: false, error: "Потрібно підключити Cloudflare D1 database." }, { status: 503 });
  }

  if (!isPartner(body.user) || typeof body.password !== "string" || body.password.trim().length < 4) {
    return Response.json({ ok: false, error: "Некоректний користувач або пароль." }, { status: 400 });
  }

  await ensureSchema(env.DB);
  const ok = await verifyOrCreateProfile(env.DB, body.user, body.password.trim());

  if (!ok) {
    return Response.json({ ok: false, error: "Пароль не той. Спокійно, попробуй ще раз." }, { status: 401 });
  }

  const state = await readState(env.DB, body.user);
  return Response.json({ ok: true, state });
}
