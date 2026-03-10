# progress.md — dao.log

> Estado del proyecto al 2026-03-09. Registro detallado de todo lo construido.

---

## Qué es esto

**dao.log** es un blog técnico personal con la tagline *"Notes from the path. AI in the wild, day by day."*
El propósito es documentar el uso real de IA en el trabajo diario — no tutoriales pulidos, sino field notes crudas: sesiones de debugging, decisiones de arquitectura, cosas que funcionaron y cosas que no.

El nombre viene de **道** (Dào) — el camino. No un destino, no un framework. Solo el camino que se recorre día a día.

**Autor:** Bragui
**Repo:** https://github.com/angelog05/dao.log
**Web:** https://angelog05.github.io/dao.log
**API:** https://dao-logapi-production.up.railway.app

---

## Stack

```
OpenClaw / CLI / cualquier cliente HTTP
        ↓
POST /api/posts  ←  JSON con markdown en "content"
        ↓
API  →  Node.js + Express + TypeScript  (Railway)
        ↓
DB   →  Supabase (PostgreSQL)
        ↓
Web  →  Astro 5 + Tailwind CSS v4  (GitHub Pages)
```

### Por qué este stack

- **Node + Express + TypeScript** — sin fricción, máximo control, tipos en toda la cadena
- **Supabase** — PostgreSQL gestionado con free tier generoso (500MB), sin tarjeta de crédito
- **Astro** — cero JS por defecto, build estático puro, soporte nativo de TypeScript
- **Tailwind CSS v4** — CSS-first config, tokens via CSS variables, mejor integración con temas dinámicos
- **GitHub Pages** — hosting gratuito, CI/CD integrado vía GitHub Actions
- **Monorepo** — API y web en el mismo repo con npm workspaces

---

## Estructura del monorepo

```
dao-log/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← GitHub Actions: build + deploy a Pages
├── packages/
│   ├── api/                        ← REST API (Node + Express + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts            ← Entry point, Express server (puerto 3001)
│   │   │   ├── types.ts            ← Interfaces compartidas (Post, DbDriver, DbResult…)
│   │   │   ├── routes/
│   │   │   │   └── posts.ts        ← CRUD endpoints /api/posts
│   │   │   ├── lib/
│   │   │   │   ├── db.ts           ← Abstracción de driver (sqlite | supabase)
│   │   │   │   ├── auth.ts         ← Middleware Bearer token
│   │   │   │   ├── logger.ts       ← Logger con timestamps ISO
│   │   │   │   ├── supabase.ts     ← Cliente Supabase singleton
│   │   │   │   └── drivers/
│   │   │   │       ├── sqlite.ts   ← Driver dev local (lowdb JSON)
│   │   │   │       └── supabase.ts ← Driver producción (Supabase)
│   │   │   ├── db/
│   │   │   │   ├── schema.sql
│   │   │   │   ├── test-connection.ts
│   │   │   │   └── seed-post.ts
│   │   │   └── slug.d.ts           ← Declaración ambient para el paquete slug
│   │   ├── dist/                   ← Build compilado (gitignored)
│   │   ├── railway.toml            ← Config de deploy: buildCommand + startCommand
│   │   ├── tsconfig.json           ← NodeNext + strict
│   │   └── package.json
│   └── web/                        ← Blog frontend (Astro 5 + Tailwind CSS v4)
│       ├── src/
│       │   ├── env.d.ts            ← Tipos para variables de entorno
│       │   ├── styles/
│       │   │   └── global.css      ← Tailwind v4: tokens, CSS vars, componentes
│       │   ├── layouts/
│       │   │   └── Base.astro      ← Layout principal + toggle día/noche
│       │   ├── lib/
│       │   │   └── api.ts          ← Cliente HTTP (PostSummary[], Post)
│       │   └── pages/
│       │       ├── index.astro     ← Home: lista de posts (fetch client-side)
│       │       ├── about.astro     ← Página about
│       │       ├── 404.astro       ← Catch-all: maneja /posts/{slug} client-side
│       │       └── posts/
│       │           └── [slug].astro ← getStaticPaths() vacío (no genera páginas)
│       ├── public/
│       │   └── favicon.svg
│       ├── astro.config.mjs        ← site, base, output: static, @tailwindcss/vite
│       └── package.json
├── .gitignore
├── package.json                    ← Workspace root (npm workspaces)
└── progress.md                     ← Este archivo
```

---

## API — Endpoints

Base URL prod: `https://dao-logapi-production.up.railway.app`
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

---

## TypeScript — Tipos compartidos (`api/src/types.ts`)

```ts
interface Post          // Forma completa del post (incluye content, updated_at)
interface PostSummary   // Sin content ni updated_at — lo que devuelve GET /api/posts
interface CreatePostPayload
interface UpdatePostPayload
interface DbResult<T>   // { data: T | null, error: { message: string } | null }
interface DbDriver      // Contrato que implementan ambos drivers
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

**Row Level Security:** lectura pública de `published = true`, escritura solo con `service_role`.

**Posts actuales en producción:**
- `ten-hours-with-openclaw` — publicado el 2026-03-01

---

## Sistema de drivers (dev vs prod)

```env
DB_DRIVER=sqlite    # desarrollo local → usa lowdb (JSON file)
DB_DRIVER=supabase  # producción → usa Supabase PostgreSQL
```

```ts
db.getPosts()            // Promise<DbResult<PostSummary[]>>
db.getPost(slug)         // Promise<DbResult<Post>>
db.createPost(payload)   // Promise<DbResult<Post>>
db.updatePost(slug, ...) // Promise<DbResult<Post>>
db.deletePost(slug)      // Promise<{ error: ... | null }>
```

---

## Arquitectura del frontend — Rendering dinámico (CSR)

La web usa Astro en modo `output: 'static'` (GitHub Pages no soporta SSR), pero los datos se
cargan en el **browser en tiempo de request**, no en el build. Esto permite que agregar o borrar
posts en la BD se refleje al refrescar sin necesitar un nuevo deploy.

### Cómo funciona

| Página | Estrategia | Detalle |
|---|---|---|
| `index.astro` | Client-side fetch | `<script>` llama a `GET /api/posts` en el browser |
| `404.astro` | Catch-all + CSR | GitHub Pages sirve `404.html` para rutas sin archivo. El script lee el slug de la URL y llama a `GET /api/posts/:slug` |
| `[slug].astro` | `getStaticPaths: []` | Devuelve array vacío → no genera HTML estático → todo cae al `404.html` |

### Flujo de navegación a un post

```
Usuario → /dao.log/posts/ten-hours-with-openclaw
        ↓
GitHub Pages: no encuentra archivo → sirve 404.html
        ↓
404.astro detecta /posts/{slug} en window.location.pathname
        ↓
fetch(API_URL + /api/posts/ten-hours-with-openclaw)
        ↓
marked() parsea el markdown → innerHTML
        ↓
Post renderizado
```

---

## Diseño visual — Tailwind CSS v4

### Configuración (CSS-first, sin `tailwind.config.ts`)

```
astro.config.mjs → @tailwindcss/vite (Vite plugin)
src/styles/global.css → @import "tailwindcss" + @plugin "@tailwindcss/typography"
```

### Arquitectura de temas

```css
:root  { --bg: #fafafa; ... }     /* tema claro  */
.dark  { --bg: #0d0d0d; ... }     /* tema oscuro */

@theme inline {
  --color-bg: var(--bg);          /* token Tailwind referencia la variable */
}

/* bg-bg, text-text, border-border → cambian automáticamente con .dark */
```

Toggle JS → `document.documentElement.classList.toggle('dark')`
Persistencia → `localStorage.setItem('theme', ...)`
Default → `prefers-color-scheme` del sistema operativo

### Paleta de colores

| Token | Claro | Oscuro |
|---|---|---|
| `--bg` | `#fafafa` | `#0d0d0d` |
| `--surface` | `#f2f2f2` | `#141414` |
| `--border` | `#e4e4e0` | `#222` |
| `--text` | `#28272a` | `#c8c8c0` |
| `--muted` | `#9a9080` | `#555` |
| `--accent` | `#a0713a` | `#c8a96e` |
| `--accent2` | `#3d6e9a` | `#6e9ecb` |

### Tipografía de posts

`@tailwindcss/typography` → `class="prose dark:prose-invert"` en el contenedor del contenido.
Estilos de `pre`, `code`, `blockquote` y `a` sobreescritos en `global.css` con CSS variables para que respondan al tema automáticamente.

### Toggle día/noche

- Botón luna/sol (SVG inline) en el header, arriba a la derecha
- Script `is:inline` en `<head>` aplica el tema antes del primer render (sin flash)

---

## Variables de entorno

### packages/api/.env
```env
DB_DRIVER=supabase
SUPABASE_URL=https://mmtqjqxtqbuuelwpubbr.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
API_SECRET=dev-secret-123
PORT=3001
```

### packages/web/.env
```env
PUBLIC_API_URL=http://localhost:3001
```

### GitHub Actions secrets
```
PUBLIC_API_URL = https://dao-logapi-production.up.railway.app
```

---

## Deploy

### API — Railway
- Root directory: `packages/api`
- Build: `npm install && npm run build` (via `railway.toml`)
- Start: `node dist/index.js`
- Health check: `/health`
- URL pública: `https://dao-logapi-production.up.railway.app`

### Web — GitHub Pages
- Trigger: push a `main`
- Build: `npm install` (root) → `npm run build:web` → `packages/web/dist/`
- URL pública: `https://angelog05.github.io/dao.log`

---

## Autenticación SSH para GitHub

- **Llave:** `C:\Users\KING ROYALE\.ssh\dao-log` (Ed25519)
- **Alias:** `github-dao-log` en `~/.ssh/config`
- **Remote:** `git@github-dao-log:angelog05/dao.log.git`

---

## Cómo correr el proyecto en local

### API
```cmd
cd packages\api
npm run dev    → tsx watch src/index.ts → http://localhost:3001
```

### Web
```cmd
cd packages\web
npm run dev    → http://localhost:4321/dao.log
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

## Mejoras pendientes

### API (`packages/api`)

| Tarea | Prioridad | Notas |
|---|---|---|
| Validación de inputs con `zod` | Alta | Sin sanitizar actualmente |
| Paginación en `GET /api/posts` | Media | Necesario con muchos posts |
| Rate limiting | Media | Proteger endpoints públicos |
| Filtro por tag `GET /api/posts?tag=x` | Media | Útil para el web |
| Tests con `vitest` | Media | Cero cobertura actualmente |
| Headers de seguridad (`helmet`) | Baja | CORS ya configurado |

### Web (`packages/web`)

| Tarea | Prioridad | Notas |
|---|---|---|
| Syntax highlighting (Shiki) | Media | Astro lo incluye nativamente |
| Tiempo de lectura estimado | Baja | Calcular desde `content` |
| Sitemap + RSS feed | Baja | Astro tiene plugins para ambos |
| OpenGraph / meta tags | Baja | `Base.astro` ya tiene `description` |
| Filtrado por tags | Futura | Requiere mejora en la API también |

---

## Historial de commits relevantes

```
389b4ee  fix(web): cleaner light theme + proper code block styling
372339b  feat(web): migrate to Tailwind CSS v4 + day/night theme toggle
ed346e5  feat(web): switch post list and post pages to client-side rendering
fe4e73f  fix(ci): fix npm cache path for monorepo in GitHub Actions
aa22be0  feat(web): add env types and align Post interfaces with API
e96e4d9  feat(api): migrate to TypeScript
cca8b07  fix: improve error handling and logging in server setup
c578f5e  feat(api): add Morgan HTTP logging and business event logger
3b205f2  feat: initial monorepo — API + Astro web + GitHub Actions
```

---

## Bugs resueltos

| Bug | Causa | Fix |
|-----|-------|-----|
| URL rota al clickear post | `BASE_URL` sin `/` separador | `` `${base}/posts/${slug}` `` con `/` explícito |
| Título duplicado en post | `# h1` del markdown + `<h1>` del layout | Strip del primer heading antes de parsear |
| `better-sqlite3` no instala | Requiere compilar con Visual Studio | Reemplazado por `lowdb` (JSON, puro JS) |
| Token de GitHub revocado | GitHub detecta tokens en chats y los revoca | Migración a SSH con llave dedicada |
| `req.params.slug` tipo incorrecto | `@types/express` v5 tipaba como `string \| string[]` | `Request<{ slug: string }>` explícito |
| Paths de `types.ts` incorrectos | Rutas relativas mal calculadas | Corregidos a `../types.js` y `../../types.js` |
| Railway buildea el web en vez de la API | Railway detecta `build:web` desde la raíz | `railway.toml` en `packages/api` + Root Directory en dashboard |
| GitHub Actions falla con npm cache | `cache-dependency-path: packages/web/package-lock.json` no existe | Cambiado a `package-lock.json` de la raíz |
| Posts borrados siguen en la web | Astro generaba HTML estático en el build | Migración a CSR: fetch en el browser, `404.astro` como catch-all |
| Code block con fondo oscuro en light mode | `--surface` del tema oscuro no cambiaba | Overrides de `.prose pre/code` en `global.css` con CSS variables |

---

*Última actualización: 2026-03-09*
