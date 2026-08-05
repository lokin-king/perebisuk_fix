# Deployment

## GitHub

1. Створи public repo `prebisyuk`.
2. Виконай:

```bash
git add .
git commit -m "Initial prebisyuk MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prebisyuk.git
git push -u origin main
```

## Cloudflare

Для `$0/month` стартуємо з:

- Cloudflare Workers для full-stack Next.js;
- без домену, на `*.workers.dev`.

## HTTPS

Cloudflare Workers автоматично дає HTTPS для `*.workers.dev`.

## Оновлення

Після кожного push у `main` GitHub Actions перевіряє lint/typecheck/build. Деплой можна робити локально через `pnpm deploy` або окремим GitHub Actions workflow з Cloudflare token.
