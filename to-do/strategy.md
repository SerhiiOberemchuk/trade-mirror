# TradeMirror Strategy

Last updated: 2026-05-20

TradeMirror should grow in controlled phases. The current priority is to make the already planned simulation workflows functional without adding new scope. Auth, UI foundation, and several admin review queues are already working, so the next valuable work is to finish the remaining planned domain workflows.

Core product boundary: all financial activity is simulated, while market data should be as real as practical. Real crypto pairs, live prices, candles, 24h change, and 24h volume can drive simulated orders, PnL, and copy trading, but user trades, balances, deposits, withdrawals, bonuses, and copy execution remain simulated.

Implementation rule: avoid giant files. Keep one file focused on one responsibility where possible; when route actions, pages, services, or helpers grow, split them into logical folders with smaller files.
Terminal trading actions were split into focused `src/server/trading/*` modules so route actions stay thin and domain lifecycle logic is easier to maintain.

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

Status: in progress after UI foundation.

Goal: define the database model for the simulation without implementing every mutation at once.

Candidate tables:

- `wallets`
- `walletTransactions`
- `tradingPairs` - schema added for admin pair management.
- `depositRequests` - schema added for simulated deposit review.
- `withdrawalRequests` - schema added for simulated withdrawal review.
- `orders`
- `positions` - schema added for simulated manual positions.
- `trades` - schema added for simulated trade monitoring and history.
- `copySettings` - schema added for persisted copy allocation controls.
- `traderProfiles` - schema added for persisted marketplace providers.
- `supportTickets` - schema added for user tickets and admin operations.
- `kycRequests` - schema added for user verification and admin review.
- `bonusCampaigns` - schema added for admin campaign controls.

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
- Create simulated deposit request. Done.
- Create simulated withdrawal request. Done.
- Submit KYC request. Done.
- Create support ticket message. Done.

## Phase 5: Simulated Trading Engine

Status: planned.

Goal: make the trading terminal and copy trading pages functional with simulated money and positions.

Market-data rule:

- Real crypto pairs from enabled `tradingPairs`.
- Real live prices and candles from a market-data adapter.
- Real 24h change and volume for market context.
- Simulated orders, balances, deposits, withdrawals, positions, PnL settlement, and copy execution.
- PnL should be calculated from real live prices against simulated entry/size data.

Work items:

- Pair selector.
- Market price source abstraction.
- Buy/sell simulation. Started with manual market order creation.
- Position lifecycle. Started with open and close actions.
- Stop loss and take profit logic. Started with optional thresholds and live-price risk exit checks.
- Trade history. Started with persisted user history and admin monitor.
- Copy trading allocation settings. Started with persisted copy settings and pause/resume controls.
- Trader performance summaries. Started with persisted provider profile metrics.
- Copy automation execution. Started with active copy settings opening and closing linked copied positions from provider manual positions.

Non-goals:

- No real custody.
- No real order execution.
- No real deposits or withdrawals.

## Phase 6: Admin Controls

Status: planned.

Goal: make admin pages control and review simulated platform state.

Completed scope:

- Real Better Auth user list.
- User role updates through Better Auth admin API.
- User ban and unban controls through Better Auth admin API.
- Persisted withdrawal request schema.
- Admin withdrawal approve and reject actions.
- User wallet withdrawal request creation.
- Persisted deposit request schema.
- Admin deposit approve and reject actions.
- User wallet deposit request creation.
- Persisted trading pair schema.
- Admin trading pair create, enable, and pause controls.
- Persisted support ticket schema.
- User support ticket creation.
- Admin support ticket reply, close, and reopen controls.
- Persisted KYC request schema.
- User verification request submission.
- Admin KYC approval and rejection controls.
- Persisted bonus campaign schema.
- Admin bonus campaign create, enable, and pause controls.
- Persisted simulated position and trade schema.
- User terminal manual order open and close actions.
- User trade history from persisted simulated trades.
- Admin trade monitor from persisted simulated trades.
- Persisted trader profile and copy setting schema.
- User marketplace profile publishing and copy allocation creation.
- User copy allocation pause and resume controls.
- Admin copy trading monitor from persisted copy settings.
- Active copy settings create linked copied positions when a provider opens a manual simulated position.
- Linked copied positions close automatically when the provider closes the source position.
- Simulated positions support optional stop loss and take profit thresholds.
- User terminal can check live Binance prices and close positions whose risk exits are hit.

Work items:

- Real-time market-data fan-out. Started with normalized SSE stream and terminal live market tape.

## Phase 7: Real-Time Layer

Status: planned after core simulation works.

Goal: add real-time market and dashboard updates without coupling UI to a single transport.

Candidate approaches:

- Binance WebSocket for exchange-native live prices, kline/candles, and 24h ticker streams.
- CoinGecko REST API for coin logos, names, market cap, and other metadata.
- TradingView Lightweight Charts for rendering chart data; it is not a market-data provider.
- Static/mock provider remains useful as a local fallback and test fixture.
- Server-Sent Events can fan out normalized live market updates to dashboards if browser/client WebSocket ownership becomes too broad.
- Normalized SSE fan-out is implemented at `/api/market/stream` for terminal market tape.
- WebSocket is appropriate for upstream market feeds and any later bidirectional realtime feature.
- Optional Redis later if the deployment model needs it.

## Current Recommendation

Smoke-test `/terminal` market stream, provider open/close flows, and terminal risk exit checks. After that, continue with hardening already planned workflows: cache tags, smoke tests, and replacing remaining static market UI with normalized market data.
