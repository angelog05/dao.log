# dao.log

> Notes from the path. AI in the wild, day by day.

## Stack

- **API** — Node + Express + Supabase
- **Web** — Astro + GitHub Pages
- **DB** — Supabase (PostgreSQL)

## Monorepo structure

```
dao-log/
├── packages/
│   ├── api/   ← REST API (Node + Express)
│   └── web/   ← Blog frontend (Astro)
└── package.json
```

## Setup

### 1. Supabase
1. Create a project at https://app.supabase.com
2. Run `packages/api/src/db/schema.sql` in the SQL Editor
3. Copy your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### 2. API
```bash
cd packages/api
cp .env.example .env   # fill in your keys
npm install
npm run dev
```

### 3. Publish a post
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_SECRET" \
  -d '{
    "title": "My first post",
    "content": "# Hello\n\nThis is my first post.",
    "excerpt": "A short description",
    "tags": ["ai", "notes"],
    "date": "2026-03-01"
  }'
```

## Author
Bragui — *道*
