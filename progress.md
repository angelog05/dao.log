# progress.md — dao.log

> Estado del proyecto al 2026-03-05. Registro detallado de todo lo construido.

---

## Qué es esto

**dao.log** es un blog técnico personal con la tagline *"Notes from the path. AI in the wild, day by day."*
El propósito es documentar el uso real de IA en el trabajo diario — no tutoriales pulidos, sino field notes crudas: sesiones de debugging, decisiones de arquitectura, cosas que funcionaron y cosas que no.

El nombre viene de **道** (Dào) — el camino. No un destino, no un framework. Solo el camino que se recorre día a día.

**Autor:** Bragui  
**Repo:** https://github.com/angelog05/dao.log  
**URL (cuando esté desplegado):** https://angelog05.github.io/dao.log

---

## Stack elegido

```
OpenClaw / CLI / cualquier cliente HTTP
        ↓
POST /api/posts  ←  JSON con markdown en "content"
        ↓
API  →  Node.js + Express
        ↓
DB   →  Supabase (PostgreSQL)
        ↓
Web  →  Astro (static site generator)
        ↓
Host →  GitHub Pages (gratis)
```

### Por qué este stack

- **Node + Express** — sin fricción, máximo control sobre la API
- **Supabase** — PostgreSQL gestionado con free tier generoso (500MB), sin tarjeta de crédito, dashboard web incluido
- **Astro** — cero JS por defecto, build estático puro, soporte nativo de TypeScript, mejor DX que Eleventy/Gatsby para blogs
- **GitHub Pages** — hosting gratuito, CI/CD integrado vía GitHub Actions
- **Monorepo** — API y web en el mismo repo con npm workspaces, un solo `git push` para deployar todo

---

## Estructura del monorepo

```
dao-log/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions: build + deploy a Pages
├── packages/
│   ├── api/                    ← REST API (Node + Express)
│   │   ├── src/
│   │   │   ├── index.js        ← Entry point, Express server (puerto 3001)
│   │   │   ├── routes/
│   │   │   │   └── posts.js    ← CRUD endpoints /api/posts
│   │   │   ├── lib/
│   │   │   │   ├── db.js       ← Abstracción de driver (sqlite | supabase)
│   │   │   │   ├── auth.js     ← Middleware Bearer token
│   │   │   │   └── drivers/
│   │   │   │       ├── sqlite.js   ← Driver dev local (lowdb JSON)
│   │   │   │       └── supabase.js ← Driver producción (Supabase)
│   │   │   └── db/
│   │   │       ├── schema.sql      ← DDL para crear tabla posts en Supabase
│   │   │       ├── test-connection.js  ← Script para verificar conexión
│   │   │       └── seed-post.js    ← Script para poblar el primer post
│   │   ├── .env                ← Variables locales (no en git)
│   │   ├── .env.example        ← Template de variables
│   │   └── package.json
│   └── web/                    ← Blog frontend (Astro)
│       ├── src/
│       │   ├── layouts/
│       │   │   └── Base.astro  ← Layout principal con todo el CSS
│       │   ├── lib/
│       │   │   └── api.ts      ← Cliente HTTP para la API (getPosts, getPost)
│       │   └── pages/
│       │       ├── index.astro         ← Home: lista de posts
│       │       ├── about.astro         ← Página about
│       │       └── posts/
│       │           └── [slug].astro    ← Página de post individual (dinámica)
│       ├── public/
│       │   └── favicon.svg
│       ├── .env                ← PUBLIC_API_URL=http://localhost:3001
│       ├── .env.example
│       ├── astro.config.mjs    ← site, base, output: static
│       └── package.json
├── .gitignore
├── package.json                ← Workspace root (npm workspaces)
├── README.md
└── progress.md                 ← Este archivo
```

---

## API — Endpoints documentados

Base URL local: `http://localhost:3001`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/posts` | No | Lista posts publicados (sin content) |
| GET | `/api/posts/:slug` | No | Post completo por slug |
| POST | `/api/posts` | Sí | Crear nuevo post |
| PATCH | `/api/posts/:slug` | Sí | Actualizar post existente |
| DELETE | `/api/posts/:slug` | Sí | Eliminar post |

**Auth:** Header `Authorization: Bearer <API_SECRET>`  
**API_SECRET en dev:** `dev-secret-123`

### Body para crear un post

```json
{
  "title": "Título del post",
  "content": "# Título\n\nContenido en markdown...",
  "excerpt": "Descripción corta para el listado",
  "tags": ["tag1", "tag2"],
  "date": "2026-03-01",
  "published": true
}
```

---

## Base de datos — Supabase

**Proyecto:** https://mmtqjqxtqbuuelwpubbr.supabase.co  
**Tabla:** `posts`

```sql
CREATE TABLE posts (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  content      text NOT NULL,
  excerpt      text DEFAULT '',
  tags         text[] DEFAULT '{}',
  published    boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);
```

**Row Level Security activado:**
- Lectura pública solo de posts con `published = true`
- Escritura solo con `service_role` key (bypasea RLS automáticamente)

**Posts actuales en BD:**
- `ten-hours-with-openclaw` — publicado el 2026-03-01

---

## Sistema de drivers (dev vs prod)

La API tiene una capa de abstracción que permite cambiar de base de datos con una sola variable:

```env
DB_DRIVER=sqlite    # desarrollo local → usa lowdb (JSON file)
DB_DRIVER=supabase  # producción → usa Supabase PostgreSQL
```

**Driver SQLite (dev):** usa `lowdb` que guarda los datos en `dev.db.json`. Sin dependencias nativas, cero configuración, funciona en cualquier máquina sin instalar nada.

> **Nota:** `better-sqlite3` fue descartado porque requiere compilar binarios nativos y Windows no tiene Visual Studio instalado.

Ambos drivers exponen exactamente la misma interfaz:
```js
db.getPosts()
db.getPost(slug)
db.createPost(payload)
db.updatePost(slug, updates)
db.deletePost(slug)
```

---

## Diseño visual

Tema oscuro minimalista con estética de terminal.

**Paleta de colores:**
```css
--bg:      #0d0d0d   /* negro casi puro */
--surface: #141414   /* superficie de cards/code */
--border:  #222      /* bordes sutiles */
--text:    #c8c8c0   /* texto principal */
--muted:   #555      /* texto secundario */
--accent:  #c8a96e   /* dorado — títulos, links activos */
--accent2: #6e9ecb   /* azul — links, tags */
```

**Tipografía:**
- UI / código: `JetBrains Mono` (Google Fonts)
- Contenido: `Noto Serif` (Google Fonts)

**Elementos de identidad:**
- `> ` antes del nombre del site (prompt de terminal)
- `道` en el footer
- Tags con borde azul en estilo badge
- Bloques de código con borde izquierdo dorado
- Scrollbar personalizado oscuro

---

## Autenticación SSH para GitHub

Se generó un par de llaves SSH dedicadas al repo:

- **Archivo privado:** `C:\Users\KING ROYALE\.ssh\dao-log`
- **Archivo público:** `C:\Users\KING ROYALE\.ssh\dao-log.pub`
- **Algoritmo:** Ed25519
- **Alias en `~/.ssh/config`:** `github-dao-log`

El remote del repo usa el alias:
```
git@github-dao-log:angelog05/dao.log.git
```

Esto permite hacer push sin token y sin contraseña.

---

## GitHub Actions — Deploy automático

Archivo: `.github/workflows/deploy.yml`

**Trigger:** push a `main`

**Flujo:**
1. Checkout del código
2. Setup Node.js 20
3. `npm install` en `packages/web`
4. `npm run build` → genera `packages/web/dist/`
5. Upload del artifact de Pages
6. Deploy a GitHub Pages

**Secret requerido:** `PUBLIC_API_URL` → URL pública de la API en producción

**Estado actual:** El workflow está configurado pero GitHub Pages aún no está activado en Settings.

---

## Variables de entorno

### packages/api/.env
```env
DB_DRIVER=supabase
SQLITE_PATH=./dev.db.json
SUPABASE_URL=https://mmtqjqxtqbuuelwpubbr.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
API_SECRET=dev-secret-123
PORT=3001
```

### packages/web/.env
```env
PUBLIC_API_URL=http://localhost:3001
```

---

## Cómo correr el proyecto en local

### API
```cmd
cd packages\api
node src/index.js
# → http://localhost:3001
```

### Web (modo dev)
```cmd
cd packages\web
npm run dev
# → http://localhost:4321/dao.log
```

### Test rápido de la API
```cmd
curl http://localhost:3001/health
curl http://localhost:3001/api/posts

REM Crear un post:
curl -X POST http://localhost:3001/api/posts ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer dev-secret-123" ^
  -d "{\"title\":\"Mi Post\",\"content\":\"Contenido...\",\"tags\":[\"ai\"]}"
```

---

## Historial de commits

```
3b205f2  feat: initial monorepo — API + Astro web + GitHub Actions
0316383  fix: strip duplicate h1 and fix base URL slashes
```

---

## Bugs resueltos

| Bug | Causa | Fix |
|-----|-------|-----|
| URL rota al clickear post | `BASE_URL` termina sin `/`, el link concatenaba sin separador | Agregado `/` explícito: `` `${base}/posts/${slug}` `` |
| Título duplicado en post | El `# heading` del markdown se renderizaba además del `<h1>` del layout | Strip del primer `# h1` del markdown antes de parsear |
| `better-sqlite3` no instala | Requiere compilar con Visual Studio (no instalado en Windows) | Reemplazado por `lowdb` (JSON file, puro JS) |
| Token de GitHub revocado | GitHub detecta tokens en texto de chats y los revoca automáticamente | Migración a SSH con llave dedicada por repo |

---

## Pendiente

### Inmediato
- [ ] Activar GitHub Pages en Settings → Source: GitHub Actions
- [ ] Agregar secret `PUBLIC_API_URL` en Settings → Secrets → Actions

### API Hosting (necesario para que el blog funcione en producción)
La API necesita un servidor siempre activo para que Astro pueda fetchear los posts en build time. Opciones:
- **Railway** — free tier generoso, deploy desde GitHub, sin tarjeta de crédito
- **Render** — free tier con cold starts, más lento
- **Fly.io** — más control, requiere CLI

### OpenClaw Integration
- [ ] Crear un skill en OpenClaw para publicar posts via Telegram:
  ```
  /v publica este post: [contenido en markdown]
  ```
  El skill construye el JSON y hace POST a la API.

### Nice to have
- [ ] Página 404 personalizada
- [ ] RSS feed (`/rss.xml`)
- [ ] Syntax highlighting en bloques de código (Shiki via Astro)
- [ ] Reading time estimado por post
- [ ] Filtrado por tags

---

*Última actualización: 2026-03-05*
