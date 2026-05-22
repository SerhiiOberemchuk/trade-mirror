<!-- BEGIN:nextjs-agent-rules -->
# TradeMirror Agent Rules

This project uses Next.js 16.2.6 with APIs and conventions that may differ from older Next.js versions. Before changing routing, caching, server functions, metadata, data fetching, or build behavior, read the relevant guide in `node_modules/next/dist/docs/`.

## Current Project Status

- Registration, email verification delivery, login, logout, protected workspace access, and admin-only access are implemented and functionally verified by the owner.
- Auth UI should keep clear success and error feedback for registration and login flows.
- Financial operations are always simulated: trades, balances, deposits, withdrawals, bonuses, PnL settlement, and copy trading execution do not touch real money or real exchange accounts.
- Market data should be as real as practical: crypto pairs, live prices, candles, 24h change, and 24h volume should come from real market-data providers when that workflow is implemented.
- The intended market-data split is Binance WebSocket for live prices/candles/tickers, CoinGecko REST for coin metadata/logos/market cap, and TradingView Lightweight Charts for rendering charts.

## Work Rules

- Follow `CODE_STYLE.md` for architecture, naming, styling, data, and quality rules.
- Keep route files and layouts as Server Components by default. Add `"use client"` only for state, browser APIs, event handlers, or client-only libraries.
- Prefer project patterns and library APIs from Next.js, Better Auth, Drizzle, React, and Tailwind before adding custom abstractions.
- Avoid giant files. One file should have one clear responsibility where possible; when actions, pages, services, or utilities grow, split them into a logical folder with smaller focused files.
- Keep route `actions.ts` files thin. Move validation, domain lifecycle logic, provider adapters, and shared helpers into focused server modules.
- Database access is server-only. Never import `@/db`, Drizzle clients, Neon clients, or server modules that touch the database from Client Components, client-only files, UI primitive barrels, error boundaries, forms, or shared component modules used by the client. Fetch database data in Server Components/layouts, Route Handlers, Server Actions, or focused `src/server/**` modules, then pass serializable data into Client Components as props.
- Do not use `throw new Error()` for expected form validation or invalid payloads in route Server Actions. Return typed action results with clear `status` and `message`; wrap database/provider mutation work in `try/catch` and show safe user-facing messages.
- Keep Drizzle domain schemas split by responsibility inside `src/db/schema` as focused `*.schema.ts` files. Do not add a schema barrel `index.ts`; Drizzle can read the schema folder directly and application code should import concrete schema modules.
- Name Drizzle table exports with an explicit `Schema` suffix, for example `withdrawalRequestsSchema`, so imports make database usage obvious.
- Derive domain row/insert/value types from Drizzle schemas and enums (`$inferSelect`, `$inferInsert`, `enumValues`) instead of manually repeating union types, table shapes, or status values.
- Do not run `drizzle-kit generate`, `drizzle-kit push`, `drizzle-kit migrate`, or `drizzle-kit studio` unless the user explicitly asks for that command.
- Do not hardcode secrets. Use the env names already documented in `.env.example`.
- Keep UI changes consistent with the dark FinTech dashboard style: dense, professional, accessible, and clearly marked as demo/simulation when money-like flows are shown.
- Keep the financial/market boundary explicit in code and UI: real market data may drive simulated trades and PnL, but simulated user actions must never be represented as real exchange execution.
- Do not mix provider-specific payloads directly into UI components. Normalize Binance/CoinGecko data behind a market-data adapter before rendering or calculating simulated trading results.
- Before finishing code changes, run `cmd /c npm run lint` and, when relevant, `cmd /c npm run build`.
<!-- END:nextjs-agent-rules -->
