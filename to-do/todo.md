# TradeMirror — Copy Trading Simulation Platform

## Implementation Status

Last updated: 2026-05-19

### Done

- [x] Created `CODE_STYLE.md` with project rules for Next.js 16, `cacheComponents`, Server Functions, cache tags, `updateTag`, DRY constants, TypeScript, and styling.
- [x] Created public design pages: `/`, `/markets`, `/top-traders`, `/how-it-works`, `/pricing`, `/security`, `/faq`, `/login`, `/register`.
- [x] Created shared public UI structure: `src/lib/navigation.ts`, `src/data/marketing.ts`, `src/components/public-shell.tsx`, `src/components/market-panels.tsx`.
- [x] Created user dashboard UI skeleton: `/dashboard`, `/terminal`, `/copy-trading`, `/trader-marketplace`, `/wallet`, `/history`, `/verification`, `/support`, `/settings`.
- [x] Created shared dashboard UI structure: `src/app/(workspace)/layout.tsx`, `src/components/dashboard-shell.tsx`, `src/data/dashboard.ts`.
- [x] Created admin dashboard UI skeleton: `/admin`, `/admin/users`, `/admin/trading-pairs`, `/admin/deposits`, `/admin/withdrawals`, `/admin/bonuses`, `/admin/trades`, `/admin/copy-trading`, `/admin/referrals`, `/admin/support`, `/admin/settings`.
- [x] Created shared admin UI structure: `src/app/(admin)/admin/layout.tsx`, `src/components/admin-shell.tsx`, `src/data/admin.ts`.
- [x] Added navigation polish pass:
  - [x] active public navigation states
  - [x] active user dashboard sidebar/mobile navigation states
  - [x] active admin sidebar/mobile navigation states
  - [x] restrained hover, focus, and active transitions for nav/buttons
  - [x] stable sticky headers without hide/show on dashboard/admin
- [x] Verified current UI with `cmd /c npm run lint` and `cmd /c npm run build`.

### Next Step

- [ ] Full design review across public, user dashboard, and admin dashboard routes.
- [ ] Fix layout density, responsive issues, navigation clarity, and visual hierarchy.
- [ ] Decide whether to add UI polish before logic:
  - [x] active nav state
  - [ ] better mobile navigation
  - [ ] loading/empty/error states
  - [ ] shared table/card primitives
  - [ ] first pass on accessibility labels and focus states

### After Design Review

- [x] Decide exact backend stack: Drizzle ORM and Better Auth.
- [ ] Add domain models and database schema.
- [x] Add base auth, email verification, and Better Auth admin role plugin.
- [ ] Add protected routes and role-based page access.
- [ ] Add Server Functions / Server Actions for mutations.
- [ ] Add centralized cache tags and `updateTag()` invalidation for mutations.
- [ ] Add real or simulated market data layer.

---

## Project Overview

TradeMirror is a premium FinTech SaaS platform for crypto trading simulation and copy trading.  
The platform allows users to trade with demo balances using real-time crypto market data, publish their trading profiles, and let other users automatically copy their trading activity.

The project is designed as a high-level portfolio application that demonstrates advanced full-stack architecture, real-time systems, dashboards, analytics, admin management, and modern FinTech UX/UI design.

The platform is not intended for real financial operations.  
All balances, deposits, withdrawals, and trading actions are simulated for demonstration purposes.

---

# Main Goals

- Demonstrate advanced full-stack development skills
- Build a premium FinTech dashboard experience
- Implement real-time market visualization
- Create a scalable SaaS-like architecture
- Showcase complex business logic
- Build an impressive portfolio project for freelance and agency clients

---

# Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TradingView Lightweight Charts

## Backend

- Next.js Server Actions
- PostgreSQL
- Prisma or Drizzle ORM
- Better Auth / NextAuth

## Real-Time

- WebSocket
- Server-Sent Events

## Infrastructure

- Docker
- Vercel or VPS deployment
- Redis (optional)

---

# User Roles

## Guest

Can access:

- Landing page
- Markets page
- Top traders
- Pricing
- FAQ
- Login/Register pages

## User / Trader

Can access:

- Dashboard
- Trading terminal
- Demo wallet
- Trade history
- Copy trading
- Trader marketplace
- Verification section
- Support chat
- Profile settings

## Admin

Can manage:

- Users
- Trading pairs
- Deposits and withdrawals
- Bonus system
- Copy trading activity
- Referrals
- Platform statistics
- Support tickets

---

# Public Pages

1. Home
2. Markets
3. Top Traders
4. How Copy Trading Works
5. Pricing
6. Security
7. FAQ
8. Login
9. Register

---

# User Dashboard Pages

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

---

# Admin Dashboard Pages

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
11. Platform Settings

---

# Main Platform Features

## Authentication

- Registration
- Login
- Protected routes
- Session management
- Role-based access

---

## Trading Terminal

Features:

- Real-time crypto charts
- Candlestick charts
- Pair selector
- Buy/Sell simulation
- Stop loss / Take profit
- Open positions
- Closed positions
- Trading history

Supported trading pairs example:

- BTC/USDT
- ETH/USDT
- SOL/USDT
- XRP/USDT

---

## Copy Trading

Features:

- Follow traders
- Automatically copy trades
- Copy percentage settings
- Trader statistics
- Risk score
- Monthly profit tracking
- Followers count

---

## Trader Marketplace

Users can publish their profile as a copy-trading provider.

Each trader profile includes:

- Avatar
- Username
- Win rate
- Monthly PnL
- Risk level
- Followers count
- Trade history
- Performance chart
- Copy button

Marketplace filters:

- Most profitable
- Lowest risk
- Most copied
- Highest win rate
- New traders

---

## Wallet System

Simulated wallet system:

- Demo balance
- Bonus balance
- Locked balance
- Deposit simulation
- Withdrawal requests
- Transaction history

---

## Bonus System

Features:

- First deposit bonus
- Second deposit bonus
- Wager system simulation
- Admin toggle for promotions

---

## Verification System

Mock KYC flow:

- Upload documents
- Verification status
- Admin approval/rejection

---

## Support Chat

Features:

- User support chat
- Ticket system
- Admin replies
- Live chat simulation

---

## Real-Time Market Data

Features:

- Live token prices
- Market capitalization
- Real-time updates
- Crypto market overview

---

# Admin Panel Features

## User Management

- View users
- Ban/unban users
- Edit balances
- View activity

## Trading Management

- Add/remove trading pairs
- Monitor trades
- View open positions

## Financial Controls

- Approve withdrawals
- Reject withdrawals
- Manage bonuses

## Analytics

- Total users
- Total trades
- Platform statistics
- Active traders
- Referral statistics

---

# Design Concept

## Style

Premium dark FinTech dashboard.

Inspired by:

- Binance
- TradingView
- Bybit
- Modern SaaS dashboards

---

# Color Palette

Background: #050816  
Surface: #0B1020  
Card: #111827  
Border: #1F2937  
Primary: #22D3EE  
Success: #10B981  
Danger: #EF4444  
Warning: #F59E0B  
Text: #F9FAFB  
Muted: #9CA3AF

---

# UI/UX Principles

- Professional trading atmosphere
- Clean information hierarchy
- Real-time feeling
- Glassmorphism elements
- Large charts and analytics
- Responsive layouts
- Smooth animations
- Premium SaaS visual quality

---

# Dashboard Layout

```txt
┌─────────────────────────────────────────────┐
│ Topbar: Search, Balance, Notifications, User │
├───────────────┬─────────────────────────────┤
│ Sidebar       │ Main Content                 │
│ Overview      │ Cards / Charts / Tables      │
│ Terminal      │                             │
│ Copy Trading  │                             │
│ Wallet        │                             │
│ Verification  │                             │
└───────────────┴─────────────────────────────┘
```
