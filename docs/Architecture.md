# Architecture

`пребісюк` стартує як free-first MVP без VPS і платних сервісів.

## Поточна архітектура

- `src/app/page.tsx` - весь інтерфейс і локальна бізнес-логіка MVP.
- `localStorage` - тимчасове приватне сховище для двох ролей на одному пристрої.
- `src/app/api/telegram/route.ts` - server-side endpoint для приватної відправки в Telegram.
- `migrations` - схема Cloudflare D1 для наступного production-кроку.

## Чому не мікросервіси одразу

Для бюджету `$0/month` класичні мікросервіси з Docker, PostgreSQL, Redis, vector DB і окремими backend-сервісами дадуть зайву складність. Поточна структура дозволяє швидко запуститись і потім винести частини в сервіси.

## Production шлях

1. Перенести profiles/memories/conflict_entries з localStorage у D1.
2. Додати server-side сесії.
3. Додати LLM provider adapter для Gemini/OpenRouter.
4. Підключити Cloudflare Workers deploy через OpenNext.
5. Додати backup/export для D1.
