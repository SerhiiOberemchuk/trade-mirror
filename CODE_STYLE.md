# TradeMirror Code Style

Цей документ фіксує правила коду для TradeMirror. Якщо правило конфліктує з локальною документацією Next.js у `node_modules/next/dist/docs/`, пріоритет має локальна документація, бо проєкт використовує Next.js `16.2.6`.

## Основний принцип

- Пишемо сучасний Next.js-код під `cacheComponents: true`.
- Орієнтуємося на Server Components, Server Functions, `"use cache"`, `cacheLife`, `cacheTag`, `updateTag` і актуальні рекомендації Next.js 16.
- Не повторюємося вручну: cache tags, route names, статуси, ролі, labels, options і доменні константи мають жити в одному місці.
- Перед змінами в routing, caching, server functions, metadata або data fetching перевіряємо відповідний файл у `node_modules/next/dist/docs/`.

## Next.js 16 та Cache Components

- `cacheComponents: true` є базовою архітектурною умовою проєкту.
- Не використовуємо старий route-level підхід `dynamic`, `revalidate`, `fetchCache` для нових рішень, якщо локальні Next-доки кажуть, що з Cache Components він замінений.
- Кешуємо на рівні функцій або компонентів через `"use cache"` якомога ближче до data access.
- Для cached scopes явно задаємо `cacheLife()`, коли строк життя даних має бізнес-сенс або коли кеш вкладений в інший cached scope.
- Для кешованих доменних даних додаємо `cacheTag()` з централізованих констант або helper-функцій.
- Runtime request APIs (`cookies`, `headers`, `searchParams`) не тягнемо всередину звичайного `"use cache"` scope. Значення дістаємо вище і передаємо аргументами, або використовуємо інший рекомендований Next.js патерн.
- `unstable_cache` не використовуємо для нового коду. У Next.js 16 його замінює `"use cache"`.

## Server Components, Client Components

- Pages і layouts лишаємо Server Components за замовчуванням.
- `"use client"` додаємо тільки для стану, effects, browser APIs, event-heavy UI або client-only бібліотек.
- UI, який може бути статичним або server-rendered, не переносимо в client component без потреби.
- Client components мають бути тонкими: інтерактивна оболонка, а не місце для data fetching і бізнес-логіки.
- Для dynamic UI із Cache Components використовуємо Suspense boundaries там, де дані справді стрімляться або залежать від runtime.

## Server Functions та mutations

- Mutations пишемо як Server Functions / Server Actions з явним `"use server"`.
- Server Function має робити одну бізнес-операцію: validate input, виконати mutation, оновити cache tags, повернути мінімальний результат.
- Не змішуємо mutation logic із JSX.
- Для форм і actions тримаємо server-side validation обов'язковою, навіть якщо є client-side validation.
- Після mutation оновлюємо кеш у тому самому Server Action, де змінили дані.
- `updateTag()` використовуємо для read-your-writes сценаріїв, коли користувач одразу має побачити власну зміну.
- `updateTag()` викликаємо тільки всередині Server Actions. Для Route Handlers або зовнішніх webhook-like сценаріїв використовуємо рекомендований Next.js API, зазвичай `revalidateTag(tag, "max")` або профіль з документації.

## Cache Tags

- Cache tags не пишемо raw string-ами в компонентах, queries або actions.
- Створюємо централізований модуль, наприклад `src/lib/cache-tags.ts`.
- Для статичних тегів використовуємо `CACHE_TAGS`.
- Для тегів з id/slug використовуємо helper-функції, щоб формат був єдиним у всьому проєкті.

```ts
export const CACHE_TAGS = {
  markets: "markets",
  tradingPairs: "trading-pairs",
  topTraders: "top-traders",
  wallet: "wallet",
} as const;

export const cacheTags = {
  trader: (traderId: string) => `trader:${traderId}`,
  userWallet: (userId: string) => `user:${userId}:wallet`,
  tradeHistory: (userId: string) => `user:${userId}:trade-history`,
} as const;
```

- У cached functions:

```ts
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS, cacheTags } from "@/lib/cache-tags";

export async function getTraderProfile(traderId: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag(CACHE_TAGS.topTraders);
  cacheTag(cacheTags.trader(traderId));

  // data access
}
```

- У Server Actions:

```ts
"use server";

import { updateTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";

export async function updateCopySettings(userId: string) {
  // validate + mutation

  updateTag(cacheTags.userWallet(userId));
  updateTag(cacheTags.tradeHistory(userId));
}
```

## DRY та константи

- Якщо значення повторюється більше одного разу і має доменний сенс, виносимо його в константу, map або helper.
- Не дублюємо ролі, route hrefs, статуси, cache tags, table columns, filter options, trading pairs.
- Для route hrefs бажано мати централізований `routes` object, коли сторінок стане більше.
- Для enum-like значень використовуємо `as const` об'єкти або union types.
- Не створюємо абстракції заради абстракцій. Виносимо тільки те, що реально зменшує повторення або ризик помилки.

## TypeScript та React

- TypeScript strict не послаблюємо.
- Не використовуємо `any`. Якщо тип невідомий, використовуємо `unknown` і звужуємо тип.
- Props описуємо окремим `type`, якщо їх більше ніж 2-3 або вони повторюються.
- Компоненти експортуємо як named export для reuse; default export лишаємо для Next.js route files.
- `params` і `searchParams` у Next.js 16 завжди типізуємо як `Promise`.
- Якщо значення потрібні тільки Server Component, читаємо їх на сервері через `await`.
- Якщо значення потрібні Client Component, Server Component передає Promise як prop, а Client Component читає його через React `use`.
- Не розгортаємо `params/searchParams` на сервері тільки для того, щоб одразу передати готовий plain object у клієнт, якщо клієнт сам є місцем використання цих значень.

```tsx
// page.tsx - Server Component
import { MarketFilters } from "./market-filters";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ pair?: string }>;
}) {
  return <MarketFilters searchParams={searchParams} />;
}
```

```tsx
// market-filters.tsx - Client Component
"use client";

import { use } from "react";

type MarketFiltersProps = {
  searchParams: Promise<{ pair?: string }>;
};

export function MarketFilters({ searchParams }: MarketFiltersProps) {
  const { pair = "BTC/USDT" } = use(searchParams);

  return <div>{pair}</div>;
}
```
- Дані, моки й конфіги описуємо структуровано: масиви/об'єкти з явними назвами полів замість розкиданих рядків у JSX.

## Структура

- `src/app` - routes, layouts, route-specific UI.
- `src/components` - reusable UI components.
- `src/lib` - shared utilities, cache tags, formatters, clients, server helpers.
- `src/data` - статичні demo/mock дані для UI.
- `src/types` - спільні доменні типи.
- `src/server` або `src/lib/server` - server-only data access/actions, коли кодова база виросте.

## Styling

- Основний підхід - Tailwind CSS utilities.
- Глобальний CSS використовуємо тільки для design tokens, базового body/html styling і справді глобальних правил.
- Dashboard UI має бути щільним, професійним і придатним для швидкого сканування даних.
- Картки використовуємо для окремих інформаційних блоків, таблиць, метрик і модалок; не вкладаємо картки в картки.
- Border radius для карток і control surfaces тримаємо стриманим: зазвичай `rounded-lg` або менше.
- Не додаємо декоративні елементи, які не допомагають продукту.

## Naming

- Компоненти: `PascalCase`.
- Функції, змінні, масиви: `camelCase`.
- Глобальні незмінні config values: `UPPER_SNAKE_CASE`.
- Файли компонентів: `kebab-case.tsx` або Next.js conventions (`page.tsx`, `layout.tsx`).
- Доменні поля називаємо по бізнес-сенсу: `monthlyPnl`, `riskScore`, `followers`, `winRate`, `copyRatio`.

## Data та FinTech правила

- Усі торгові, депозитні й wallet-операції в цьому проєкті є симуляцією.
- UI не повинен створювати враження реальних фінансових операцій без явної позначки demo/simulation.
- Форматування грошей, відсотків і чисел виносимо в shared helpers, щойно воно повторюється.
- Live market updates ізолюємо від UI, щоб mock, SSE і WebSocket можна було міняти без переписування компонентів.

## Quality

- Перед завершенням зміни запускаємо `cmd /c npm run lint` і, коли доречно, `cmd /c npm run build`.
- Для shared business logic додаємо тести, коли з'явиться test runner.
- Не комітимо generated/cache artifacts: `.next`, `out`, `build`.
- Не змінюємо unrelated файли під час фічі або фіксу.
