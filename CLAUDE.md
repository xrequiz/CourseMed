@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**CourseMed** is an AI-powered medical education web application. Students and healthcare professionals browse structured courses (modules → lessons) and interact with a Claude-powered AI tutor for on-demand medical explanations. The AI tutor is for educational purposes only — every response must carry that framing.

---

## Stack Choices & Why

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack SSR + Server Actions in one codebase; no separate API server needed |
| Language | TypeScript strict | End-to-end type safety including Prisma-generated types |
| Styling | Tailwind CSS v4 | Utility-first; v4 uses PostCSS and drops `tailwind.config.js` |
| Components | Radix UI primitives + CVA | Accessible headless components; `cn()` util merges classes cleanly |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Type-safe queries; Prisma 7 uses driver adapters instead of internal engines |
| Database | PostgreSQL | Relational data fits course → module → lesson hierarchy; set `DATABASE_URL` |
| Auth | NextAuth.js v5 (Auth.js) | Adapter-based session via `@auth/prisma-adapter`; OAuth only (GitHub + Google) |
| AI | `@anthropic-ai/sdk` | Direct streaming to Anthropic; no middleman SDK overhead |
| Validation | Zod v4 | All API route inputs validated with `.safeParse()` before DB calls |
| Forms | React Hook Form + Zod resolvers | Uncontrolled forms with schema validation on the client side |

---

## Commands

```bash
# Development
npm run dev           # Start dev server at http://localhost:3000

# Code quality
npm run lint          # ESLint (next/core-web-vitals rules)
npm run typecheck     # tsc --noEmit

# Database
npm run db:generate   # Re-generate Prisma client after schema changes
npm run db:push       # Push schema to DB without migration (dev/prototyping)
npm run db:migrate    # Create + apply a named migration (production-ready)
npm run db:studio     # Open Prisma Studio at http://localhost:5555
npm run db:seed       # Run prisma/seed.ts to populate sample data

# Production
npm run build
npm run start
```

**After any change to `prisma/schema.prisma`**, always run `npm run db:generate` so the TypeScript client is in sync.

---

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL           # PostgreSQL connection string
AUTH_SECRET            # Random 32-byte base64 string (openssl rand -base64 32)
AUTH_URL               # Full origin, e.g. http://localhost:3000
AUTH_GITHUB_ID/SECRET  # GitHub OAuth app credentials
AUTH_GOOGLE_ID/SECRET  # Google OAuth credentials
ANTHROPIC_API_KEY      # Anthropic API key
```

At minimum you need one OAuth provider (GitHub or Google) and the Anthropic key.

---

## Architecture

### Request flow

```
Browser
  └─> Next.js App Router (RSC)
        ├─> Server Components fetch directly from Prisma (no fetch hop)
        ├─> Server Actions mutate data (src/actions/)
        └─> Route Handlers (src/app/api/) for streaming & external clients
              └─> Anthropic SDK  ──> claude-sonnet-4-6
```

### Route groups

```
src/app/
├── (marketing)/      # Public pages; layout includes Navbar only
├── (auth)/login/     # Sign-in page; no auth guard
├── (dashboard)/      # Auth-guarded layout (redirects to /login if no session)
│   ├── courses/      # Course catalogue + individual course pages
│   ├── chat/         # AI tutor chat interface
│   └── profile/      # User profile
└── api/
    ├── auth/[...nextauth]/   # NextAuth.js handler
    ├── chat/                 # Streaming AI chat endpoint
    └── courses/              # REST-style course API
```

The `(dashboard)/layout.tsx` calls `auth()` server-side and `redirect("/login")` if no session — **all child pages inherit this guard automatically**.

### Data model relationships

```
User
 ├── Enrollment → Course → Module → Lesson
 ├── UserProgress → Lesson
 └── ChatSession → ChatMessage[]
```

`Course` → `Module` → `Lesson` is the course hierarchy. Users enroll in courses and track progress per lesson. Chat sessions belong to users and persist message history for context.

### AI chat pipeline (`src/app/api/chat/route.ts`)

1. Validate session (401 if missing)
2. Validate request body with Zod
3. Verify `ChatSession.userId === session.user.id`
4. Load last 20 messages from DB for context
5. Persist the new USER message
6. Open an Anthropic streaming request with `MEDICAL_SYSTEM_PROMPT`
7. Stream raw text chunks as `text/plain` to the client
8. After stream closes, persist the full ASSISTANT response

The client (`ChatInterface`) reads the stream chunk-by-chunk and updates a temporary "streaming" message in state, then the persisted copy takes over on next load.

### Key files

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | NextAuth config, exports `auth`, `signIn`, `signOut`, `handlers` |
| `src/lib/db.ts` | Prisma singleton (safe for Next.js hot-reload) |
| `src/lib/anthropic.ts` | Anthropic client singleton + `MEDICAL_SYSTEM_PROMPT` |
| `src/lib/utils.ts` | `cn()` — Tailwind class merger |
| `src/actions/enrollment.ts` | Server Actions for enroll/progress (call from Client Components) |
| `prisma/schema.prisma` | Single source of truth for all data models |

---

## UI/UX Conventions

- **Component source**: All primitives live in `src/components/ui/` (Button, Card, Input, etc.) — built on Radix UI + CVA pattern. Add new ones here before reaching for a third-party component.
- **Variants via CVA**: Use `cva()` + `cn()` for any component with multiple visual states. Never conditionally concatenate Tailwind strings.
- **Server vs Client components**: Default to Server Components. Add `"use client"` only when you need `useState`, `useEffect`, event handlers, or browser APIs. The `ChatInterface` is the primary client boundary.
- **Dark mode**: Tailwind CSS v4 handles dark mode via CSS variables. Avoid hardcoded colors; use semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`).
- **Loading states**: Use `loading.tsx` files alongside route `page.tsx` files for Suspense-based skeleton loading.
- **Accessibility**: Always pass `aria-label` to icon-only buttons; use Radix Dialog/Tooltip primitives rather than custom modals.

---

## Next.js 16 Notes

Next.js 16 has breaking changes from older versions. **Always read the bundled docs in `node_modules/next/dist/docs/` before implementing any routing, caching, or data-fetching pattern.** Key areas to check:

- Instant navigation: `unstable_instant` export requirement for fast client-side transitions (see `02-guides/instant-navigation.mdx`)
- Cache components: new `<Cache>` component replaces some `fetch` cache patterns (see `02-guides/migrating-to-cache-components.md`)
- Route Handlers: use standard Web `Request`/`Response` APIs — no `NextRequest`/`NextResponse` wrappers needed for simple routes

---

## Prisma 7 Conventions

Prisma 7 no longer accepts `url` in `prisma/schema.prisma`. The connection URL lives in `prisma.config.ts` (for CLI tools) and is passed via the `@prisma/adapter-pg` driver adapter in `src/lib/db.ts` (for the runtime client).

- Run `db:generate` immediately after schema edits — TypeScript won't compile otherwise.
- Use `db push` for rapid local iteration; use `db migrate` for any change that will go to production.
- Never import `PrismaClient` directly in components — always use the singleton from `src/lib/db.ts`.
- Enum values in the schema (e.g., `UserRole`, `MessageRole`) are used as string literals in TypeScript; import them from `@prisma/client`.
- The `PrismaPg` adapter wraps a `pg` pool; the `DATABASE_URL` environment variable is read at runtime in `src/lib/db.ts`.

---

## Auth Conventions

- `auth()` is the primary way to get the session in Server Components and Route Handlers.
- `signIn()` / `signOut()` are called from Server Actions inside forms with `"use server"`.
- Session type is extended in `src/lib/auth.ts` to include `user.id` — use `session.user.id` everywhere.
- The Prisma adapter manages the `Account`, `Session`, and `VerificationToken` tables automatically.
