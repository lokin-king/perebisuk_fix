# API

У MVP основний застосунок має один server-side endpoint для Telegram.

## Telegram notify

`POST /api/telegram`

Request:

```json
{
  "kind": "entry",
  "payload": {
    "owner": "Саша",
    "hurt": "...",
    "angryBecause": "...",
    "aiAnswer": "..."
  }
}
```

Response:

```json
{
  "ok": true
}
```

Endpoint читає `TELEGRAM_BOT_TOKEN` і `TELEGRAM_CHAT_ID` з environment secrets. Якщо secrets не задані, локально він тихо пропускає відправку, щоб застосунок не ламався.
