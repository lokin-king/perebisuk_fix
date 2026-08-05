# Telegram

Telegram інтеграція не має видимих налаштувань у застосунку. Token і chat id задаються тільки на хостингу через secrets.

## Як створити бота

1. Напиши `@BotFather` у Telegram.
2. `/newbot`
3. Скопіюй token.
4. Додай token у Cloudflare secret:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
```

## Як знайти chat id

Найпростіше: тимчасово написати боту повідомлення і перевірити updates через Telegram API. Потім записати chat id у secret:

```bash
wrangler secret put TELEGRAM_CHAT_ID
```

## Як працює відправка

Застосунок більше не має окремого `/api/telegram`. Повідомлення відправляються з server-side routes:

- `POST /api/entries`
- `POST /api/memories`

Secrets мають бути в Cloudflare Worker runtime:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```
