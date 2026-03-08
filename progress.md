# progress.md — dao.log

> Estado del proyecto al 2026-03-07. Registro detallado de todo lo construido.

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
API  →  Node.js + Express + TypeScript
        ↓
DB   →  Supabase (PostgreSQL)
        ↓
Web  →  Astro (static site generator + TypeScript)
        ↓
Host →  GitHub Pages (gratis)
```

### Por qué este stack

- **Node + Express + TypeScript** — sin fricción, máximo control, tipos en toda la cadena
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
│   ├── api/                    ← REST API (Node + Express + TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts        ← Entry point, Express server (puerto 3001)
│   │   │   ├── types.ts        ← Interfaces compartidas (Post, DbDriver, DbResult…)
│   │   │   ├── routes/
│   │   │   │   └── posts.ts    ← CRUD endpoints /api/posts
│   │   │   ├── lib/
│   │   │   │   ├── db.ts       ← Abstracción de driver (sqlite | supabase)
│   │   │   │   ├── auth.ts     ← Middleware Bearer token
│   │   │   │   ├── logger.ts   ← Logger con timestamps ISO
│   │   │   │   ├── supabase.ts ← Cliente Supabase singleton
│   │   │   │   └── drivers/
│   │   │   │       ├── sqlite.ts   ← Driver dev local (lowdb JSON)
│   │   │   │       └── supabase.ts ← Driver producción (Supabase)
│   │   │   ├── db/
│   │   │   │   ├── schema.sql      ← DDL para crear tabla posts en Supabase
│   │   │   │   ├── test-connection.ts  ← Script para verificar conexión
│   │   │   │   └── seed-post.ts    ← Script para poblar el primer post
│   │   │   └── slug.d.ts       ← Declaración ambient para el paquete slug
│   │   ├── dist/               ← Build compilado (gitignored)
│   │   ├── tsconfig.json       ← NodeNext + strict
│   │   ├── .env                ← Variables locales (no en git)
│   │   ├── .env.example        ← Template de variables
│   │   └── package.json
│   └── web/                    ← Blog frontend (Astro + TypeScript)
│       ├── src/
│       │   ├── env.d.ts        ← Tipos para variables de entorno (PUBLIC_API_URL)
│       │   ├── layouts/
│       │   │   └── Base.astro  ← Layout principal con todo el CSS
│       │   ├── lib/
│       │   │   └── api.ts      ← Cliente HTTP (getPosts→PostSummary[], getPost→Post)
│       │   └── pages/
│       │       ├── index.astro         ← Home: lista de posts
│       │       ├── about.astro         ← Página about
│       │       └── posts/
│       │           └── [slug].astro    ← Página de post individual (dinámica)
│       ├── public/
│       │   └── favicon.svg
│       ├── tsconfig.json       ← Extiende astro/tsconfigs/strict
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

## TypeScript — Tipos compartidos (`api/src/types.ts`)

```ts
interface Post          // Forma completa del post (incluye content, updated_at)
interface PostSummary   // Sin content ni updated_at — lo que devuelve GET /api/posts
interface CreatePostPayload
interface UpdatePostPayload
interface DbResult<T>   // { data: T | null, error: { message: string } | null }
interface DbDriver      // Contrato que implementan ambos drivers
```

El web (`web/src/lib/api.ts`) define sus propios tipos alineados:
- `PostSummary` — para `getPosts()` (lista)
- `Post extends PostSummary` — para `getPost(slug)` (detalle)

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
- `mi-primer-post-de-prueba`
- `una-semana-con-claude-code`

---

## Sistema de drivers (dev vs prod)

La API tiene una capa de abstracción que permite cambiar de base de datos con una sola variable:

```env
DB_DRIVER=sqlite    # desarrollo local → usa lowdb (JSON file)
DB_DRIVER=supabase  # producción → usa Supabase PostgreSQL
```

**Driver SQLite (dev):** usa `lowdb` que guarda los datos en `dev.db.json`. Sin dependencias nativas, cero configuración, funciona en cualquier máquina sin instalar nada.

> **Nota:** `better-sqlite3` fue descartado porque requiere compilar binarios nativos y Windows no tiene Visual Studio instalado.

Ambos drivers implementan la interfaz `DbDriver`:
```ts
db.getPosts()                    // Promise<DbResult<PostSummary[]>>
db.getPost(slug)                 // Promise<DbResult<Post>>
db.createPost(payload)           // Promise<DbResult<Post>>
db.updatePost(slug, updates)     // Promise<DbResult<Post>>
db.deletePost(slug)              // Promise<{ error: ... | null }>
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

---

## GitHub Actions — Deploy automático

Archivo: `.github/workflows/deploy.yml`

**Trigger:** push a `main`

**Flujo:**
1. Checkout del código
2. Setup Node.js 20
3. `npm install` en `packages/web`
4. `npm run build` → genera `packages/web/dist/` (la API debe estar online en este paso)
5. Upload del artifact de Pages
6. Deploy a GitHub Pages

**Secret requerido:** `PUBLIC_API_URL` → URL pública de la API en producción

**Estado actual:** Workflow configurado. GitHub Pages y el secret aún no están activados.

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

### API (dev con hot reload)
```cmd
cd packages\api
npm run dev
REM → tsx watch src/index.ts → http://localhost:3001
```

### API (producción compilada)
```cmd
cd packages\api
npm run build
npm run start
REM → node dist/index.js → http://localhost:3001
```

### Web (modo dev)
```cmd
cd packages\web
npm run dev
REM → http://localhost:4321/dao.log
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

## Plan de publicación

### 1 — Verificar datos en Supabase
Confirmar que el schema y los posts están en la instancia online antes del deploy.

### 2 — Deploy de la API (Railway recomendado)
```
1. railway.app → New Project → Deploy from GitHub repo
2. Seleccionar packages/api como root directory
3. Configurar variables de entorno:
   DB_DRIVER=supabase
   SUPABASE_URL=https://mmtqjqxtqbuuelwpubbr.supabase.co
   SUPABASE_SERVICE_KEY=<key>
   API_SECRET=<secret-seguro>
   PORT=3001
4. Railway genera URL pública → ej. https://dao-log-api.up.railway.app
```

### 3 — Activar GitHub Pages
```
github.com/angelog05/dao.log → Settings → Pages → Source: GitHub Actions
```

### 4 — Agregar secret en GitHub Actions
```
Settings → Secrets and variables → Actions → New repository secret
Nombre: PUBLIC_API_URL
Valor:  https://dao-log-api.up.railway.app
```

### 5 — Merge PR y push a main
```
Mergear feat/api-typescript → main
El deploy.yml se dispara automáticamente
Astro buildea con la API real → sube a GitHub Pages
```

### URLs finales
| Servicio | URL |
|---|---|
| Web | https://angelog05.github.io/dao.log |
| API | https://dao-log-api.up.railway.app |
| DB  | https://mmtqjqxtqbuuelwpubbr.supabase.co |

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
| OpenClaw/Telegram integration | Futura | Publicar posts desde Telegram |

### Web (`packages/web`)

| Tarea | Prioridad | Notas |
|---|---|---|
| Página 404 personalizada | Alta | Redirige a `/404` que no existe |
| Syntax highlighting (Shiki) | Media | Astro lo incluye nativamente |
| Tiempo de lectura estimado | Baja | Calcular desde `content` |
| Sitemap + RSS feed | Baja | Astro tiene plugins para ambos |
| OpenGraph / meta tags | Baja | `Base.astro` ya tiene `description` |
| Componente `PostCard` | Baja | Extraer del `index.astro` |
| Filtrado por tags | Futura | Requiere mejora en la API también |

---

## Historial de commits

```
aa22be0  feat(web): add env types and align Post interfaces with API
e96e4d9  feat(api): migrate to TypeScript
cca8b07  fix: improve error handling and logging in server setup
c578f5e  feat(api): add Morgan HTTP logging and business event logger
4ec0a77  docs: add HTTP request examples for the API
d1d051f  docs: add progress.md with full project context
0316383  fix: strip duplicate h1 and fix base URL slashes
3b205f2  feat: initial monorepo — API + Astro web + GitHub Actions
```

---

## Bugs resueltos

| Bug | Causa | Fix |
|-----|-------|-----|
| URL rota al clickear post | `BASE_URL` termina sin `/`, el link concatenaba sin separador | Agregado `/` explícito: `` `${base}/posts/${slug}` `` |
| Título duplicado en post | El `# heading` del markdown se renderizaba además del `<h1>` del layout | Strip del primer `# h1` del markdown antes de parsear |
| `better-sqlite3` no instala | Requiere compilar con Visual Studio (no instalado en Windows) | Reemplazado por `lowdb` (JSON file, puro JS) |
| Token de GitHub revocado | GitHub detecta tokens en texto de chats y los revoca automáticamente | Migración a SSH con llave dedicada por repo |
| `req.params.slug` tipo incorrecto | `@types/express` v5 lo tipaba como `string \| string[]` | Tipado explícito con `Request<{ slug: string }>` |
| Paths de `types.ts` incorrectos | Rutas relativas mal calculadas tras crear el archivo en `src/` | Corregidos a `../types.js` y `../../types.js` según profundidad |

---

*Última actualización: 2026-03-07*
