# TradeMirror: інструкція по платформі

Цей документ пояснює, що вже можна робити в TradeMirror, у якому порядку тестувати платформу, і за що відповідає кожен пункт навігації.

TradeMirror - це демонстраційна FinTech-платформа для симульованого crypto trading і copy trading. Вона виглядає як реальний trading-продукт, але всі фінансові дії всередині платформи є симуляцією.

## Головне правило платформи

- Реальні дані: ринкові ціни, 24h зміна, volume і candles можуть приходити з Binance.
- Симульовані дії: баланс, депозити, виводи, бонуси, угоди, PnL, copy trading і виконання ордерів не працюють з реальними грошима або біржовими акаунтами.
- Admin не проводить реальні фінансові операції. Admin лише керує симульованими заявками, ролями, ринками і станами платформи.

## Ролі

### Guest

Гість може дивитися публічну частину сайту:

- головну сторінку;
- ринки;
- топ трейдерів;
- опис роботи платформи;
- guide;
- pricing;
- security;
- FAQ;
- login/register.

Гість не має доступу до workspace і admin panel.

### User / Client

Клієнт після реєстрації, email verification і логіну працює в user workspace. Тут він може:

- дивитися overview свого симульованого акаунта;
- відкривати симульовані long/short позиції;
- закривати позиції;
- ставити stop loss і take profit;
- дивитися історію угод;
- створювати симульовані deposit/withdrawal requests;
- застосовувати bonus code;
- подавати KYC request;
- створювати support tickets;
- публікувати trader profile;
- копіювати інших trader profiles.

### Admin

Admin має доступ до `/admin`. Він може:

- дивитися операційний overview;
- керувати користувачами, ролями і ban/unban;
- додавати і вмикати trading pairs;
- approve/reject deposit requests;
- approve/reject withdrawal requests;
- review KYC requests;
- створювати і вмикати bonus campaigns;
- дивитися trade monitor;
- дивитися copy trading monitor;
- керувати referral profiles;
- відповідати на support tickets;
- бачити platform settings/runtime status.

Admin також може відкрити client workspace, щоб перевірити user-side flows, але це окремий режим.

## Рекомендований порядок тестування

### 1. Підготовка admin

1. Зайти як admin.
2. Переконатися, що після логіну відкривається `/admin`.
3. Відкрити `Trading Pairs`.
4. Додати або увімкнути мінімум одну пару, наприклад `BTC/USDT`.

Без enabled trading pair клієнт не зможе нормально тестувати trading terminal. - це що для кожного клієнта потрібно вмикати? мені буде сповіщення що є новий клієнт і він хоче щось робити?

### 2. Підготовка client

1. Зареєструвати client account.
2. Підтвердити email.
3. Увійти в акаунт.
4. Переконатися, що client відкриває `/dashboard`, а не `/admin`.

### 3. Wallet flow

1. Client відкриває `Wallet`.
2. Client створює simulated deposit request.
3. Admin відкриває `Deposits`. - адмін встановлює депозит клієнту? клієнту буде сповіщення що є доступний депозит?
4. Admin approve або reject заявку. - клієнту буде сповіщення?
5. Client повертається в `Wallet` і перевіряє оновлений стан.
6. Client створює simulated withdrawal request.
7. Admin відкриває `Withdrawals`. - як адмін це буде знати?
8. Admin approve або reject withdrawal.

### 4. Trading flow

1. Client відкриває `Terminal`.
2. Обирає enabled pair.
3. Вказує side: long або short.
4. Вказує notional і leverage.
5. За потреби вказує stop loss/take profit.
6. Натискає `Open simulated order`.
7. Відкрита позиція з'являється в `Open positions`.

- що робити із цими позиціями?

8. Client може натиснути `Close`, щоб закрити позицію.
9. Client відкриває `History`, щоб перевірити trade history.
10. Admin відкриває `Trades`, щоб побачити platform-level trade monitor.

### 5. Copy trading flow

1. Client відкриває `Marketplace`.
2. Публікує або знаходить trader profile.
3. Створює copy allocation для trader profile. - навіщо це клієнтові?
4. Перевіряє активний copy setting у `Copy Trading`.
5. Provider відкриває симульовану позицію в `Terminal`.
6. Copy automation створює linked copied position для follower.
7. Коли provider закриває source position, linked copied positions також мають закриватися.
8. Admin перевіряє це в `Admin -> Copy Trading`.

### 6. KYC flow

1. Client відкриває `Verification`.
2. Submit simulated KYC request.
3. Admin відкриває `KYC Review`.
4. Admin approve або reject request.
5. Client повертається в `Verification` і бачить оновлений статус.

### 7. Support flow

1. Client відкриває `Support`.
2. Створює support ticket.
3. Admin відкриває `Support`.
4. Admin пише відповідь, close або reopen ticket.
5. Client бачить admin reply у своєму support view.

## Public navigation

### Home `/`

Публічна презентаційна сторінка TradeMirror. Пояснює продукт, demo trading і базову цінність платформи.

### Markets `/markets`

Публічний список enabled crypto pairs з реальним market context, якщо дані доступні. Використовується як preview перед входом у terminal.

### Top Traders `/top-traders`

Публічна вітрина published simulated trader profiles. Показує трейдерів, яких можна буде копіювати після входу.

### How it works `/how-it-works`

Пояснює базову логіку copy trading simulation: як користувач відкриває демо акаунт, торгує, копіює трейдерів і контролює risk.

### Guide `/guide`

Публічний user guide. Пояснює, що в платформі реальне, що симульоване, і як рухатися по основних workspace areas.

### Pricing `/pricing`

Презентаційна сторінка тарифів. На поточному етапі це SaaS presentation layer, не реальний billing.

### Security `/security`

Пояснює security model, role-based access і simulation boundary.

### FAQ `/faq`

Відповіді на базові питання про платформу, demo boundary, market data і copy trading.

## User workspace navigation

### Overview `/dashboard`

Головна сторінка client workspace. Тут видно:

- demo balance;
- open exposure;
- unrealized PnL;
- copy allocation;
- відкриті позиції;
- активні copy settings;
- wallet activity;
- support ticket status.

Це сторінка для швидкої перевірки загального стану акаунта.

### Terminal `/terminal`

Симульований trading terminal. Тут client може:

- дивитися market chart;
- бачити live market tape;
- обрати trading pair;
- відкрити long або short simulated order;
- вказати leverage;
- вказати notional;
- додати stop loss/take profit;
- закрити open position;
- вручну запустити risk exit check.

Важливо: ордери тут симульовані, але entry/current price можуть братися з реального Binance market data.

### Copy Trading `/copy-trading`

Сторінка керування copy settings. Тут client бачить, кого він копіює, яку allocation задав, який ratio використовується, і може pause/resume copy setting.

### Marketplace `/trader-marketplace`

Сторінка published trader profiles. Тут client може:

- переглядати simulated provider profiles;
- бачити profile stats;
- створити copy allocation;
- опублікувати власний trader profile через форму.

### Trader Profile `/trader-profile`

Сторінка власного provider profile. Тут client бачить, як його профіль виглядає як trader profile, і може керувати publish/pause станом.

### Wallet `/wallet`

Симульований wallet. Тут client може:

- бачити demo balance;
- бачити bonus balance;
- бачити pending review amount;
- створити simulated deposit request;
- застосувати bonus code;
- створити simulated withdrawal request;
- переглядати deposit/withdrawal queues;
- бачити wallet-related transactions.

Всі wallet дії є симуляцією.

### History `/history`

Історія активності client акаунта. Тут відображаються:

- simulated trade executions;
- manual і copied trades;
- wallet/deposit/withdrawal/bonus event previews.

### Verification `/verification`

Симульований KYC workflow. Тут client може створити verification request і побачити статус review.

Це не реальний compliance onboarding.

### Support `/support`

Support workspace для client. Тут можна:

- створити ticket;
- бачити статус ticket;
- прочитати admin reply.

### Settings `/settings`

Налаштування профілю client. Тут можна оновити ім'я профілю і побачити account role/status.

## Admin navigation

### Admin Overview `/admin`

Операційний dashboard для admin. Показує:

- total users;
- trader profiles;
- open tickets;
- pending withdrawals;
- короткий withdrawal queue;
- copy trading activity;
- support escalation.

Це сторінка для швидкого огляду стану платформи.

### Users `/admin/users`

User management через Better Auth. Admin може:

- бачити real user records;
- бачити email verification status;
- бачити role;
- зробити user admin або admin user;
- ban/unban користувача.

Поточний admin не може забанити або понизити самого себе через UI.

### Trading Pairs `/admin/trading-pairs`

Керування ринками для terminal. Admin може:

- створити trading pair;
- задати spread;
- задати max leverage;
- задати simulated volume;
- enable/pause pair.

Client terminal використовує enabled pairs.

### Deposits `/admin/deposits`

Review queue для simulated deposit requests. Admin може approve або reject deposit request. Approved deposit збільшує demo balance у client wallet.

### Withdrawals `/admin/withdrawals`

Review queue для simulated withdrawal requests. Admin може approve або reject withdrawal request. Це не реальний вивід коштів.

### KYC Review `/admin/kyc`

Review queue для simulated KYC requests. Admin може approve або reject request і додати review note.

### Bonuses `/admin/bonuses`

Керування bonus campaigns. Admin може:

- створити bonus campaign;
- задати code;
- задати amount;
- enable/pause campaign.

Client може застосувати active bonus code у `Wallet`.

### Trades `/admin/trades`

Platform-level monitor для simulated trades. Admin бачить manual і copied trade executions, які створюються через terminal/copy automation.

### Copy Trading `/admin/copy-trading`

Моніторинг copy trading settings. Admin бачить, які followers копіюють яких traders, allocation, ratio і status.

### Referrals `/admin/referrals`

Керування simulated referral profiles. Admin може створювати referral profile для existing user, задавати referral code і simulated reward amount, а також active/pause status.

### Support `/admin/support`

Admin support desk. Admin може:

- переглядати support tickets;
- писати admin reply;
- close ticket;
- reopen ticket.

### Settings `/admin/settings`

Runtime/platform settings overview. Показує службову інформацію про auth, database, market provider і simulation boundary.

## Що зараз ще потрібно перевірити вручну

Після останніх route/layout змін треба вручну пройти:

- register;
- email verification;
- login;
- logout;
- protected workspace routes;
- admin redirect після login;
- user не має доступу до `/admin`;
- admin має доступ до `/admin`;
- wallet deposit/withdrawal flow;
- support ticket flow;
- KYC review flow;
- trading pair controls;
- admin user controls.

## Як працюють сповіщення

У платформі додано notification center для client і admin.

### Де їх бачити

Client бачить сповіщення тут:

- індикатор `Updates` у верхній панелі;
- пункт меню `Notifications`;
- сторінка `/notifications`.

Admin бачить сповіщення тут:

- індикатор `Updates` у верхній панелі admin workspace;
- пункт меню `Notifications`;
- сторінка `/admin/notifications`.

Якщо є непрочитані сповіщення, біля `Updates` показується червоний лічильник.

### Коли створюються сповіщення

Admin отримує сповіщення, коли client:

- створює support ticket;
- створює simulated deposit request;
- створює simulated withdrawal request;
- подає simulated KYC request.

Client отримує сповіщення, коли admin:

- approve/reject deposit request;
- approve/reject withdrawal request;
- approve/reject KYC request;
- відповідає на support ticket;
- закриває або перевідкриває support ticket.

Client також отримує notification, коли bonus code успішно застосовано як approved simulated credit.

### Як працює звук

У topbar є перемикач `Sound off/on`.

- За замовчуванням звук вимкнений.
- Користувач має сам натиснути `Sound on`.
- Якщо після цього з'явиться нове unread notification, браузер програє короткий звуковий сигнал.
- Це зроблено так, бо браузери зазвичай блокують autoplay-звук без дії користувача.

Звук не є основним механізмом. Основний механізм - persisted notification у базі, unread counter і сторінка notification center.

## Що ще не є фінально реалізованим

- Binance WebSocket ще не є основним upstream live transport. Зараз є Binance REST і SSE fan-out.
- CoinGecko metadata/logos/market cap layer ще не додано.
- TradingView Lightweight Charts ще не підключено.
- Pricing є presentation page, не реальний billing.
- Всі фінансові workflow залишаються demo/simulated.
