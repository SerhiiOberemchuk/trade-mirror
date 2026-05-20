<!-- BEGIN:nextjs-agent-rules -->
# TradeMirror Agent Rules

This project uses Next.js 16.2.6 with APIs and conventions that may differ from older Next.js versions. Before changing routing, caching, server functions, metadata, data fetching, or build behavior, read the relevant guide in `node_modules/next/dist/docs/`.

## Current Project Status

- Registration, email verification delivery, login, logout, protected workspace access, and admin-only access are implemented and functionally verified by the owner.
- Auth UI should keep clear success and error feedback for registration and login flows.
- Trading, wallet, deposits, withdrawals, bonuses, KYC, support, and admin operations are simulations unless explicitly changed later.

## Work Rules

- Follow `CODE_STYLE.md` for architecture, naming, styling, data, and quality rules.
- Keep route files and layouts as Server Components by default. Add `"use client"` only for state, browser APIs, event handlers, or client-only libraries.
- Prefer project patterns and library APIs from Next.js, Better Auth, Drizzle, React, and Tailwind before adding custom abstractions.
- Do not run `drizzle-kit generate`, `drizzle-kit push`, `drizzle-kit migrate`, or `drizzle-kit studio` unless the user explicitly asks for that command.
- Do not hardcode secrets. Use the env names already documented in `.env.example`.
- Keep UI changes consistent with the dark FinTech dashboard style: dense, professional, accessible, and clearly marked as demo/simulation when money-like flows are shown.
- Before finishing code changes, run `cmd /c npm run lint` and, when relevant, `cmd /c npm run build`.
<!-- END:nextjs-agent-rules -->
