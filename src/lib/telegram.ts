import { RuntimeEnv } from "./cloudflare";

export async function sendTelegram(env: RuntimeEnv, text: string) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || !text.trim()) {
    return { ok: false, skipped: true };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  return { ok: response.ok, skipped: false, status: response.status };
}
