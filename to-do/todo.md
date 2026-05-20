# TradeMirror - Copy Trading Simulation Platform

## Implementation Status

Last updated: 2026-05-20

### Done

- [x] Created `CODE_STYLE.md` with project rules for Next.js 16, `cacheComponents`, Server Functions, cache tags, `updateTag`, DRY constants, TypeScript, and styling.
- [x] Created public design pages: `/`, `/markets`, `/top-traders`, `/how-it-works`, `/pricing`, `/security`, `/faq`, `/login`, `/register`.
- [x] Created shared public UI structure: `src/lib/navigation.ts`, `src/data/marketing.ts`, `src/components/public-shell.tsx`, `src/components/market-panels.tsx`.
- [x] Created user dashboard UI skeleton: `/dashboard`, `/terminal`, `/copy-trading`, `/trader-marketplace`, `/wallet`, `/history`, `/verification`, `/support`, `/settings`.
- [x] Created shared dashboard UI structure: `src/app/(workspace)/layout.tsx`, `src/components/dashboard-shell.tsx`, `src/data/dashboard.ts`.
- [x] Created admin dashboard UI skeleton: `/admin`, `/admin/users`, `/admin/trading-pairs`, `/admin/deposits`, `/admin/withdrawals`, `/admin/bonuses`, `/admin/trades`, `/admin/copy-trading`, `/admin/referrals`, `/admin/support`, `/admin/settings`.
- [x] Created shared admin UI structure: `src/app/(admin)/admin/layout.tsx`, `src/components/admin-shell.tsx`, `src/data/admin.ts`.
- [x] Configured Drizzle ORM, Better Auth, auth API route, and generated auth schema/migrations.
- [x] Added auth forms for registration and login with email verification.
- [x] Added visible success feedback after registration when the verification email is sent.
- [x] Added password visibility toggles to login and registration password fields.
- [x] Added Better Auth admin plugin for user/admin roles and user management APIs.
- [x] Added password policy: 12-128 characters, browser password-manager hints, and compromised password checks via Better Auth `haveIBeenPwned()`.
- [x] Added protected route access for workspace pages and admin-only access for admin pages.
- [x] Added authenticated topbar UI with real user identity and logout action.
- [x] Functionally verified registration, email verification, login, logout, protected routes, and admin redirect.
- [x] Connected `/admin/users` to real Better Auth users with role and ban controls.
- [x] Added persisted simulated withdrawal request schema and admin approve/reject actions.
- [x] Connected user wallet withdrawal request form to the admin withdrawal review queue.
- [x] Added persisted simulated deposit request schema, user wallet request form, and admin approve/reject actions.
- [x] Added persisted trading pair schema and admin create/enable/pause controls.
- [x] Added persisted support ticket schema, user ticket creation, and admin reply/close/reopen actions.
- [x] Added persisted KYC request schema, user verification submission, and admin approve/reject review.
- [x] Added persisted bonus campaign schema and admin create/enable/pause controls.
- [x] Added persisted simulated position/trade schema, terminal order open/close actions, user trade history, and admin trade monitor.
- [x] Added persisted trader profile and copy setting schema, marketplace publish/copy actions, user copy controls, and admin copy monitor.
- [x] Added copy automation execution for active copy settings when provider positions open/close.
- [x] Added stop loss and take profit thresholds with live-price risk exit checks for simulated positions.
- [x] Connected the user dashboard overview to real wallet, trade, copy trading, support, and live-price PnL data.
- [x] Connected user trade history account activity to real deposit and withdrawal records.
- [x] Added user profile settings update action and real admin overview/settings runtime panels.
- [x] Added user bonus code application flow backed by persisted bonus campaigns and simulated approved deposits.
- [x] Added project rule to avoid giant files and keep one file focused on one responsibility.
- [x] Split Drizzle app schemas into focused `*.schema.ts` domain files and removed the schema barrel `index.ts`.
- [x] Renamed Drizzle table exports to explicit `*Schema` names and updated app imports to use concrete schema modules.
- [x] Split terminal trading actions into focused server modules for validation, lifecycle, copy automation, risk exits, and revalidation.
- [x] Added normalized SSE market-data fan-out and live terminal market tape from real Binance prices.
- [x] Added Binance candle adapter and real OHLCV candlestick panel on the trading terminal.
- [x] Added centralized cache tags and `updateTag()` mutation invalidation helpers for existing Server Actions.
- [x] Generated and applied Drizzle migrations for persisted deposit, withdrawal, trading pair, support ticket, and KYC workflows.
- [x] Generated and applied Drizzle migrations for bonus campaign and simulated trading workflows.
- [x] Generated and applied Drizzle migrations for trader profile and copy setting workflows.
- [x] Generated and applied Drizzle migrations for copied position link fields and stop loss / take profit fields on `simulated_position`.
- [x] Added navigation polish pass:
  - [x] active public navigation states
  - [x] active user dashboard sidebar/mobile navigation states
  - [x] active admin sidebar/mobile navigation states
  - [x] restrained hover, focus, and active transitions for nav/buttons
  - [x] stable sticky headers without hide/show on dashboard/admin
- [x] Verified current UI with `cmd /c npm run lint` and `cmd /c npm run build`.

### Next Step

Active phase: make the already planned domain workflows functional.

- [x] Review public, workspace, and admin routes for layout density, responsive behavior, navigation clarity, and visual hierarchy.
- [x] Add shared UI primitives for repeated dashboard/admin surfaces:
  - [x] page headers
  - [x] metric cards
  - [x] data tables
  - [x] status badges
  - [x] empty states
  - [x] loading states
  - [x] error states
  - [x] action toolbars
- [x] Improve mobile navigation for workspace and admin sections.
- [x] Add first-pass accessibility labels, focus states, status regions, and keyboard-friendly controls.
- [ ] Re-run auth flow after layout changes: register, verify email, login, logout, protected routes, admin redirect.
- [ ] Re-run smoke tests for wallet deposits/withdrawals, support tickets, KYC review, trading pair controls, and admin user controls after the latest migrations.

### After Design Review

- [x] Decide exact backend stack: Drizzle ORM and Better Auth.
- [x] Add base auth, email verification, Better Auth admin role plugin, password policy, and compromised password protection.
- [x] Add protected routes and role-based page access.
- [x] Add first real admin mutation surface: Better Auth user role and ban controls.
- [ ] Add remaining domain models and database schema.
- [ ] Add remaining Server Functions / Server Actions for mutations.
- [x] Add centralized cache tags and `updateTag()` invalidation for mutations.
- [x] Add real or simulated market data layer.

## Project Overview

TradeMirror is a premium FinTech SaaS platform for crypto trading simulation and copy trading.

The platform allows users to trade with demo balances using market data, publish simulated trading profiles, and let other users copy simulated trading activity. It is designed as a portfolio-grade full-stack application that demonstrates auth, dashboards, analytics, admin management, real-time systems, and FinTech UX.

The platform is not intended for real financial operations. All balances, deposits, withdrawals, bonuses, trades, and copy trading activity are simulated.

Market data rule: all financial activity is simulated, while market data should be as real as practical. Real crypto pairs, live prices, candles, 24h change, and 24h volume may drive simulated trades, PnL, and copy trading results.

## Main Goals

- Demonstrate advanced full-stack development skills.
- Build a premium FinTech dashboard experience.
- Implement real-time market visualization.
- Create a scalable SaaS-like architecture.
- Showcase complex business logic.
- Build a strong portfolio project for freelance and agency clients.

## Technology Stack

Frontend:

- Next.js 16 with `cacheComponents`
- TypeScript
- Tailwind CSS
- shadcn/ui planned
- Framer Motion planned
- TradingView Lightweight Charts planned

Backend:

- Next.js Server Actions
- PostgreSQL
- Drizzle ORM
- Better Auth

Real-time:

- Binance WebSocket for live prices, candles, and 24h ticker data
- CoinGecko REST API for coin logos, names, market cap, and metadata
- TradingView Lightweight Charts for chart rendering
- Server-Sent Events for normalized dashboard fan-out when useful
- WebSocket when upstream market streaming or bidirectional behavior is needed

Infrastructure:

- Docker
- Vercel or VPS deployment
- Redis optional

## User Roles

Guest can access:

- Landing page
- Markets page
- Top traders
- Pricing
- FAQ
- Login and register pages

User or trader can access:

- Dashboard
- Trading terminal
- Demo wallet
- Trade history
- Copy trading
- Trader marketplace
- Verification section
- Support chat
- Profile settings

Admin can manage:

- Users
- Trading pairs
- Deposits and withdrawals
- Bonus system
- Copy trading activity
- Referrals
- Platform statistics
- Support tickets

## Public Pages

1. Home
2. Markets
3. Top Traders
4. How Copy Trading Works
5. Pricing
6. Security
7. FAQ
8. Login
9. Register

## User Dashboard Pages

1. Overview
2. Trading Terminal
3. Copy Trading
4. Trader Marketplace
5. Trader Profile
6. Wallet
7. Deposits
8. Withdrawals
9. Trade History
10. Verification
11. Support Chat
12. Settings

## Admin Dashboard Pages

1. Admin Overview
2. Users
3. Trading Pairs
4. Deposits
5. Withdrawals
6. Bonuses
7. Trades History
8. Copy Trading Activity
9. Referrals
10. Support Tickets
11. KYC Review
12. Platform Settings

## Main Platform Features

Authentication:

- Registration
- Login
- Logout
- Email verification
- Protected routes
- Session management
- Role-based access

Trading terminal:

- Real crypto pairs
- Real live prices
- Real candlestick data
- Real 24h change and volume
- Pair selector
- Buy/sell simulation
- Stop loss and take profit
- Open positions
- Closed positions
- Trading history

Copy trading:

- Follow traders
- Automatically copy simulated trades
- Copy percentage settings
- Trader statistics
- Risk score
- Monthly profit tracking
- Followers count

Trader marketplace:

- Provider profiles
- Win rate
- Monthly PnL
- Risk level
- Followers count
- Trade history
- Performance chart
- Copy action

Wallet system:

- Demo balance
- Bonus balance
- Locked balance
- Deposit simulation
- Withdrawal requests
- Transaction history

Market/financial boundary:

- BTC/USDT, ETH/USDT, and other enabled pairs should use real market data when the market-data layer is implemented.
- User trades are simulated.
- User balances are simulated.
- Deposits and withdrawals are simulated.
- PnL is calculated from real live price changes against simulated positions.
- Copy trading is simulated but based on real price movement.

Admin panel:

- User management
- Trading pair management
- Simulated deposit and withdrawal review
- Bonus controls
- Trade monitoring
- Copy trading monitoring
- Support tickets
- KYC review

## Design Concept

Style: premium dark FinTech dashboard inspired by Binance, TradingView, Bybit, and modern SaaS dashboards.

Color palette:

- Background: `#050816`
- Surface: `#0B1020`
- Card: `#111827`
- Border: `#1F2937`
- Primary: `#22D3EE`
- Success: `#10B981`
- Danger: `#EF4444`
- Warning: `#F59E0B`
- Text: `#F9FAFB`
- Muted: `#9CA3AF`

UI principles:

- Professional trading atmosphere.
- Clean information hierarchy.
- Dense dashboard layouts for scanning.
- Clear demo/simulation boundaries.
- Responsive layouts.
- Accessible labels, focus states, and status feedback.
