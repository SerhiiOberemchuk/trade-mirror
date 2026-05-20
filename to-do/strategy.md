# TradeMirror Strategy

Last updated: 2026-05-20

TradeMirror should grow in controlled phases. The current priority is to turn the existing static shell into a polished product surface before adding deeper domain logic. Auth is already working, so the next valuable work is UI foundation, then domain schema, then simulated trading workflows.

## Phase 1: Auth And Protected Shell

Status: mostly complete.

Goal: make the app safe to navigate as a signed-in user or admin.

Completed scope:

- Registration with email verification delivery.
- Login and logout.
- Protected workspace routes.
- Admin-only route access.
- Authenticated topbars with real user identity.
- Clear registration feedback and password visibility controls.

Remaining scope:

- Keep auth UI consistent while other shared primitives are introduced.
- Re-check auth flow after any layout, route, or shell refactor.

## Phase 2: UI Foundation

Status: code-complete, pending final manual auth flow check after layout changes.

Goal: make public, workspace, and admin pages feel like one coherent product before connecting domain data.

Work items:

- Review public pages, workspace pages, and admin pages route by route.
- Improve dashboard and admin density, responsive behavior, and visual hierarchy.
- Add shared UI primitives for repeated product surfaces: page headers, metric cards, data tables, status badges, empty states, loading states, error states, and action toolbars.
- Improve mobile navigation for workspace and admin sections.
- Add first-pass accessibility polish: labels, focus states, status regions, and keyboard-friendly controls.

Acceptance criteria:

- Main pages are usable on desktop and mobile.
- Repeated table/card/status patterns are not copy-pasted across pages.
- Demo/simulation boundaries are visible where money-like operations are shown.
- `cmd /c npm run lint` and `cmd /c npm run build` pass.

## Phase 3: Domain Schema

Status: planned after UI foundation.

Goal: define the database model for the simulation without implementing every mutation at once.

Candidate tables:

- `wallets`
- `walletTransactions`
- `tradingPairs`
- `orders`
- `positions`
- `trades`
- `copySettings`
- `traderProfiles`
- `supportTickets`
- `kycRequests`
- `bonusCampaigns`

Rules:

- Keep application domain tables in `src/db/schema`.
- Keep Better Auth tables generated in `auth-schema.ts`.
- Do not run Drizzle generate, push, migrate, or studio without explicit user approval.
- After schema edits, clearly state which Drizzle command the owner should run.

## Phase 4: Server Actions And Cache Tags

Status: planned after domain schema.

Goal: introduce mutations in a Next.js 16-compatible way.

Work items:

- Add `src/lib/cache-tags.ts` before cached domain reads are added.
- Implement focused Server Actions for one business operation at a time.
- Validate inputs server-side even when client controls already validate.
- Use `updateTag()` inside Server Actions for read-your-writes flows.
- Keep mutation logic out of JSX.

Candidate first actions:

- Update copy trading settings.
- Create simulated deposit request.
- Create simulated withdrawal request.
- Submit KYC request.
- Create support ticket message.

## Phase 5: Simulated Trading Engine

Status: planned.

Goal: make the trading terminal and copy trading pages functional with simulated money and positions.

Work items:

- Pair selector.
- Market price source abstraction.
- Buy/sell simulation.
- Position lifecycle.
- Stop loss and take profit logic.
- Trade history.
- Copy trading allocation settings.
- Trader performance summaries.

Non-goals:

- No real custody.
- No real order execution.
- No real deposits or withdrawals.

## Phase 6: Admin Controls

Status: planned.

Goal: make admin pages control and review simulated platform state.

Work items:

- User list and role/status controls.
- Trading pair management.
- Simulated deposit and withdrawal review.
- Bonus campaign toggles.
- Trade and copy trading monitoring.
- Support ticket replies.
- KYC approval and rejection.

## Phase 7: Real-Time Layer

Status: planned after core simulation works.

Goal: add real-time market and dashboard updates without coupling UI to a single transport.

Candidate approaches:

- Static/mock provider first.
- Server-Sent Events for live dashboard updates.
- WebSocket only when bidirectional behavior is actually needed.
- Optional Redis later if the deployment model needs it.

## Current Recommendation

Proceed with Phase 2. The next implementation task should be shared UI primitives plus a focused design review pass on workspace/admin pages. This gives the domain work stable components to render into.
