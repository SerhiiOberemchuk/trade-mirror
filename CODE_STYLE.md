# TradeMirror Code Style

This document defines project rules for TradeMirror. If a rule conflicts with local Next.js documentation in `node_modules/next/dist/docs/`, follow the local Next.js docs because this project uses Next.js `16.2.6`.

## Core Principles

- Build for Next.js 16 with `cacheComponents: true`.
- Prefer Server Components by default. Use `"use client"` only for state, effects, browser APIs, event handlers, or client-only libraries.
- Read the relevant file in `node_modules/next/dist/docs/` before changing routing, caching, Server Functions, metadata, data fetching, or build behavior.
- Keep files focused. One file should have one clear responsibility where possible.
- Avoid giant files. When a page, action file, service, or component grows, split it into a logical folder with smaller focused files.
- Do not add abstractions only for style. Add them when they remove real duplication, reduce risk, or express a domain rule clearly.

## Imports And Re-exports

- Avoid broad barrel files and broad re-exports.
- Do not create `src/db/schema/index.ts`.
- App code must import concrete Drizzle schema modules directly, for example:

```ts
import { withdrawalRequestsSchema } from "@/db/schema/wallet.schema";
```

- Re-exporting UI primitives is allowed only when the module adds useful domain naming or context, for example `DashboardCard` or `AdminPageHeader`.
- Do not re-export all schemas, all utilities, or all components from a generic index just for convenience.
- `src/db/index.ts` should create and export the Drizzle client only. It should not aggregate app schemas.
- If Better Auth needs its generated schema, import `auth-schema.ts` directly in the Better Auth config.

## Database And Drizzle

- Domain schemas live in `src/db/schema` as focused `*.schema.ts` files.
- `drizzle.config.ts` should point Drizzle Kit at the schema folder, not at a schema barrel:

```ts
schema: ["./src/db/schema", "./auth-schema.ts"]
```

- Name Drizzle table exports with a `Schema` suffix:
  - `withdrawalRequestsSchema`
  - `tradingPairsSchema`
  - `simulatedPositionsSchema`

- Name Drizzle enum exports with an `Enum` suffix:
  - `withdrawalRiskLevelEnum`
  - `simulatedPositionSideEnum`

- Do not duplicate table definitions in multiple places.
- Do not manually repeat domain union types when the value can come from Drizzle:

```ts
type PositionSide = (typeof simulatedPositionSideEnum.enumValues)[number];
type PositionRow = typeof simulatedPositionsSchema.$inferSelect;
type NewPosition = typeof simulatedPositionsSchema.$inferInsert;
```

- For `db.select().from(tableSchema)` style queries, `drizzle({ client })` is enough. Do not pass all app schemas into the Drizzle client unless we intentionally start using `db.query.*`.
- Codex must not run `drizzle-kit generate`, `drizzle-kit push`, `drizzle-kit migrate`, or `drizzle-kit studio` unless the user explicitly asks.
- After changing schema shape, tell the user that migration generation/application is required, but do not run it automatically.

## Auth

- `src/lib/auth.ts` configures Better Auth only.
- Keep Better Auth generated schema in `auth-schema.ts`.
- Do not mix app domain schemas into the Better Auth adapter unless Better Auth explicitly requires them.
- Auth forms must keep clear success and error feedback for registration, verification email delivery, login, and logout.
- Password policy must stay centralized in `src/lib/auth-password-policy.ts`.

## Server Actions And Mutations

- Route `actions.ts` files should stay thin.
- Move validation, lifecycle logic, provider adapters, calculations, and shared helpers into focused server modules.
- Every Server Action must validate input on the server.
- Expected form and payload validation failures must not use `throw new Error()`.
- Server Actions must return a typed result for expected outcomes, usually `ActionResult` from `src/server/actions/state.ts`, with a clear `status` and `message`.
- Use `try/catch` around database writes, provider calls, and other failure-prone mutation work so unexpected failures become safe user-facing messages.
- Keep `throw` only for framework control flow, authentication/authorization guards, or server-only helpers where the caller intentionally catches and translates the failure.
- Mutations should invalidate data through centralized helpers, not scattered raw cache calls.
- Use `updateTag()` for read-your-writes Server Action invalidation.
- Use `revalidatePath()` alongside tags when the route shell or route payload must refresh.
- Keep cache tag strings centralized in `src/lib/cache-tags.ts`.
- Keep shared mutation invalidation helpers in `src/server/cache`.

## Cache Components

- Do not use old route-level caching patterns for new work if the local Next.js 16 docs recommend a Cache Components pattern instead.
- Put `"use cache"` as close to the data access as practical.
- Use `cacheLife()` when cached data has a meaningful lifetime.
- Use `cacheTag()` with centralized tags.
- Do not pull runtime request APIs such as `cookies`, `headers`, or `searchParams` into a normal `"use cache"` scope.
- Do not use `unstable_cache` for new code.

## Market And Financial Boundary

- All financial operations are simulated:
  - trades
  - balances
  - deposits
  - withdrawals
  - bonuses
  - PnL settlement
  - copy trading execution

- Market data should be as real as practical:
  - real crypto pairs
  - real live prices
  - real candles
  - real 24h change
  - real 24h volume

- Real market data may drive simulated trades and simulated PnL.
- User actions must never be represented as real exchange execution.
- UI must keep demo/simulation boundaries clear anywhere money-like flows appear.
- Do not pass provider-specific payloads directly into UI. Normalize Binance/CoinGecko data behind market-data adapters first.

## Frontend Structure

- Pages and layouts stay as Server Components unless interactivity requires a Client Component.
- Keep Client Components small and focused on interaction.
- Do not put database queries or privileged business logic in Client Components.
- Large route files should be split into focused local modules when they grow:
  - `columns.tsx`
  - `forms.tsx`
  - `formatters.ts`
  - `data.ts`
  - `actions.ts`

- Repeated dashboard/admin UI should use shared primitives from `src/components/dashboard/primitives.tsx`.
- Avoid nested cards. Use cards for repeated items, tables, modals, and framed tool surfaces only.
- Dashboard UI should be dense, professional, and optimized for scanning.

## Naming

- Components: `PascalCase`.
- Functions, variables, and arrays: `camelCase`.
- Global constant objects: `UPPER_SNAKE_CASE`.
- Component files: `kebab-case.tsx`.
- Schema files: `domain.schema.ts`.
- Server helper files: focused `kebab-case.ts`.
- Domain names should describe business meaning, not implementation detail.

## TypeScript

- Keep TypeScript strict.
- Do not use `any`. Use `unknown` and narrow it.
- Do not use `@ts-ignore` or `@ts-expect-error` unless there is no reasonable alternative and the reason is documented.
- Props can be inline for tiny components, but use named `type` declarations when props grow or repeat.
- Use schema-derived types for database rows and insert values.
- Use `Route` from `next` for typed route hrefs in navigation config.
- In Next.js 16, type `params` and `searchParams` as `Promise`.

## Project Structure

- `src/app` - routes, layouts, route-local UI, and route-local Server Actions.
- `src/components` - reusable UI components.
- `src/data` - static demo/marketing data.
- `src/db` - Drizzle client and app schemas.
- `src/lib` - shared config, constants, clients, and lightweight utilities.
- `src/server` - server-only business logic, provider adapters, privileged helpers, email, cache invalidation.

## Quality Checks

- Before finishing code changes, run:

```bash
cmd /c npx tsc --noEmit
cmd /c npm run lint
```

- Run `cmd /c npm run build` after changes that affect routing, caching, Server Components, auth, Drizzle schema, or build behavior.
- Do not commit generated/cache artifacts such as `.next`, `out`, or `build`.
- Do not hardcode secrets. Use environment variables documented in `.env.example`.
