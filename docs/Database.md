# Database

## Cloudflare D1

Схема лежить у `migrations/0001_initial.sql`.

Таблиці:

- `profiles`
- `memories`
- `conflict_entries`

Команда для застосування міграцій після створення D1:

```bash
wrangler d1 migrations apply prebisyuk
```

У застосунку також є автоматичний `ensureSchema`, тому таблиці створяться при першому запиті, якщо D1 binding `DB` підключений.
