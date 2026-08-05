# Security

## Поточний MVP

- Паролі не зберігаються як plain text: використовується SHA-256 hash з prefix ролі.
- Записи розділені по ролях.
- Видалення акаунта не реалізовано за вимогою.
- Дані не відправляються в AI API.

## Обмеження

`localStorage` не є повноцінним production-сховищем. Людина з доступом до пристрою і браузера може витягнути дані.

## Production

Для production треба:

- server-side sessions;
- D1 storage;
- rate limit;
- encrypted sensitive fields;
- backup/export;
- audit logs для `/api/telegram`.
