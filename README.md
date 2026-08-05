# пребісюк

Приватний web app для Саші і Марини, щоб спокійно розкладати сварки, згадувати важливе одне про одного і швидше миритись.

## Що вже є

- вхід для двох ролей: `Саша` і `Марина`;
- пароль створюється при першому вході;
- усі записи приватні для вибраної ролі на цьому пристрої;
- форма конфлікту: чим образив/образила і чому я злий/зла;
- реальний AI через Gemini API key, з fallback якщо ключа нема;
- приватна пам'ять з категоріями;
- історія відповідей;
- dark mode;
- приватна серверна відправка записів у Telegram через environment secrets;
- GitHub Actions, issue templates, PR template;
- Cloudflare D1 для спільних даних між телефоном і ноутом.

## Стек

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react
- Cloudflare Workers для безкоштовного full-stack hosting
- Cloudflare D1 як майбутня production база

## Локальний запуск

```bash
pnpm install
pnpm dev
```

Відкрий `http://localhost:3000`.

## Перевірка

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## GitHub

```bash
git init
git add .
git commit -m "Initial prebisyuk MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prebisyuk.git
git push -u origin main
```

## Cloudflare Workers hosting

Цей проєкт деплоїться як full-stack Next.js на Cloudflare Workers через OpenNext adapter.

Локально на Windows `opennextjs-cloudflare build` може впасти через symlink permission. Це нормально для Windows; деплой краще робити через GitHub Actions/Linux або WSL.

## Чому телефон і ноут тепер синхронізуються

Записи більше не лежать тільки в браузері. Профілі, пам'ять і історія йдуть у Cloudflare D1 через server-side API routes:

- `POST /api/auth`
- `GET /api/state`
- `POST /api/entries`
- `POST /api/memories`

## Cloudflare D1

Створи D1 database `prebisyuk` у Cloudflare Dashboard, скопіюй `database_id` і додай у `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "prebisyuk"
database_id = "PASTE_DATABASE_ID_HERE"
```

Схема створюється автоматично при першому запиті.

## Telegram

Telegram не налаштовується в інтерфейсі. Token і chat id задаються тільки як secrets на хостингу.

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

GitHub Actions workflow також синхронізує ці secrets у Cloudflare Worker перед деплоєм.

## AI

Щоб був справжній AI, додай GitHub secret:

```text
GEMINI_API_KEY
```

Модель за замовчуванням:

```text
gemini-2.5-flash
```

Якщо ключа нема або Gemini тимчасово не відповідає, застосунок дає fallback-відповідь, щоб не ламатись.

Деплой:

```bash
pnpm deploy
```

## Важливо про безкоштовний AI

У MVP AI працює як локальний empathy engine: він не потребує платного API і використовує приватну пам'ять. Це не така якість, як GPT/Claude/Gemini, але повністю безкоштовно і стабільно для старту.

Коли буде API ключ Gemini/OpenRouter, можна додати справжню LLM відповідь поверх цієї логіки.
