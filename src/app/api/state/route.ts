import { getRuntimeEnv } from "@/lib/cloudflare";
import { ensureSchema, isPartner, readState } from "@/lib/db";
import { emptyState } from "@/lib/types";

export async function GET(request: Request) {
  const env = await getRuntimeEnv();
  const user = new URL(request.url).searchParams.get("user");

  if (!env.DB) {
    return Response.json({
      ok: false,
      setupRequired: true,
      error: "Cloudflare D1 binding DB is not configured.",
      state: emptyState,
    });
  }

  await ensureSchema(env.DB);
  const state = await readState(env.DB, isPartner(user) ? user : undefined);

  return Response.json({ ok: true, state });
}
