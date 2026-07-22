# LedgerLine

An AI-adjacent net worth ledger for financial advisors whose clients hold
real estate alongside stocks. Advisors track each client's equities, rental
properties, and debt in one place, get live cap rate / cash-on-cash return
calculations, and generate a printable net worth statement. Billed monthly,
per firm.

This app does **not** give investment advice, execute trades, or manage
money. It is a reporting and calculation tool for advisors who are already
licensed — so it does not require any financial license to operate.

---

## 0. What you'll need (all free to start)

| Service | What it's for | Cost |
|---|---|---|
| [Supabase](https://supabase.com) | Database + login | Free tier |
| [Twelve Data](https://twelvedata.com) | Live stock prices | Free tier (800 calls/day) |
| [Dodo Payments](https://dodopayments.com) | Monthly billing | Free to set up, they take a transaction fee once you charge customers |
| [Vercel](https://vercel.com) | Hosting | Free tier |
| [GitHub](https://github.com) | Code storage (needed for Vercel to deploy) | Free |

Total setup time: roughly 30-40 minutes, mostly copy-pasting keys.

---

## 1. Supabase setup (database + login)

1. Go to supabase.com → New project. Pick any name/region, set a database password (save it somewhere).
2. Once it's created, go to **SQL Editor → New query**, paste in the entire contents of `supabase/schema.sql` from this folder, and click **Run**. This creates all the tables and security rules.
3. Go to **Authentication → Providers** and make sure **Email** is enabled. Optional: under **Authentication → Settings**, you can turn off "Confirm email" if you want new advisors to be able to sign in immediately without clicking a confirmation email (fine for testing, consider turning it back on for production).
4. Go to **Settings → API**. Copy three values — you'll need them in step 5:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click reveal) → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret, never put it in frontend code)

## 2. Twelve Data setup (live stock prices)

1. Go to twelvedata.com → sign up free.
2. Dashboard shows your API key immediately. Copy it → this is `TWELVE_DATA_API_KEY`.
3. Free tier is 800 requests/day and 8/minute — plenty for an MVP. The app caches each price for 60 seconds to stay well within that.

## 3. Dodo Payments setup (billing)

1. Go to [dodopayments.com](https://dodopayments.com) → sign up, complete business verification for your account (needed before you can go live — test mode works immediately without it).
2. In the dashboard, go to **Products** → create a new **Subscription** product (e.g. "LedgerLine — Solo Plan"), set your monthly price. Copy its product ID (looks like `prod_xxxxxxxx`) → this is `DODO_PAYMENTS_PRODUCT_ID`.
3. Go to **Developer → API Keys**, create a key → this is `DODO_PAYMENTS_API_KEY`. Use a **test mode** key while developing.
4. Go to **Developer → Webhooks → Add Webhook**:
   - URL: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/billing/webhook` (add/edit this after your first deploy, once you have a real domain)
   - Events to enable: everything under `subscription.*` and `payment.*` (subscription created/active/renewed/cancelled/expired, payment succeeded/failed)
   - Copy the signing secret it gives you → this is `DODO_PAYMENTS_WEBHOOK_SECRET`
5. Set `DODO_PAYMENTS_ENVIRONMENT=test_mode` while developing. Switch to `live_mode` (and a live API key) once you're ready to take real payments.

You can finish the webhook step after deploying once, since you need your live URL for it.

Unlike some billing providers, there's no separate "hosted checkout link" to
copy — `/api/billing/checkout` calls the Dodo API directly and redirects
each advisor to their own unique checkout session, tagged with their
account ID so the webhook knows whose subscription just changed.

## 4. Preview locally before deploying

This lets you click through the whole app before anyone else sees it.

```bash
npm install
cp .env.example .env.local
# open .env.local and paste in the values from steps 1-3
npm run dev
```

Open `http://localhost:3000` in your browser. Sign up as a test advisor, add a test client, add a stock and a property, open the report. This is your full preview.

## 5. Deploy to Vercel

**Option A — easiest, no terminal:**
1. Push this folder to a new GitHub repository (create a repo on github.com, then follow the "push an existing repository" instructions it gives you).
2. Go to vercel.com → New Project → Import your GitHub repo.
3. Before clicking Deploy, open **Environment Variables** and paste in every value from your `.env.local` file (all 8 of them).
4. Click **Deploy**. In about a minute you'll get a live URL like `ledgerline.vercel.app`.

**Option B — from the terminal:**
```bash
npm install -g vercel
vercel login
vercel
# follow the prompts, then add your env vars when asked, or via:
vercel env add NEXT_PUBLIC_SUPABASE_URL
# (repeat for each variable)
vercel --prod
```

**Vercel gives you a free preview URL on every push automatically** — every git push creates its own preview deployment before you promote anything to your main production URL. That's your built-in "preview before it goes live" step going forward.

After your first deploy, go back to Dodo Payments' webhook settings and update the URL to your real `https://yourapp.vercel.app/api/billing/webhook`.

## 6. Set your trial length

`NEXT_PUBLIC_TRIAL_DAYS` controls the number shown in the UI. The actual
enforcement happens in `supabase/schema.sql` where `trial_ends_at` defaults
to `now() + interval '14 days'`. To change it, edit that line in the schema
file before running it, or run this in the SQL Editor any time:

```sql
alter table profiles alter column trial_ends_at set default (now() + interval '14 days');
```

(swap `14 days` for whatever you want, e.g. `7 days` or `30 days`)

---

## Website vs. app store — which one to use

Build this as a **website only**. Do not put it on the Play Store or App
Store. Reasons:

- Your customers are financial advisors working at a desk, not consumers
  browsing an app store. Nobody discovers a B2B compliance/reporting tool
  by searching the Play Store.
- Apple charges a $99/year developer account; Google charges a one-time $25.
  Neither is "free," and both add review delays every time you ship an update.
  A website update goes live the moment you push to Vercel.
- Every feature here (auth, tables, PDF report) works identically in a
  mobile browser, so advisors can still use it on a phone or tablet without
  you building or maintaining a separate app.

If you eventually want an app-like experience, add a PWA manifest (a small
JSON file) so people can "Add to Home Screen" from their browser — free,
and doesn't require app store approval. That's a good v2 addition, not
needed for launch.

---

## How the free trial + paywall works

- Every new advisor gets `subscription_status = 'trial'` and
  `trial_ends_at = now() + 14 days` automatically (set by the database
  trigger in `schema.sql`).
- `app/dashboard/layout.tsx` checks this on every dashboard page load. Once
  `trial_ends_at` passes and `subscription_status` is still `trial`, the
  dashboard is replaced with a "trial ended, add payment" screen — no
  manual cutoff logic to maintain.
- When an advisor subscribes through Dodo Payments, the webhook
  (`app/api/billing/webhook/route.ts`) flips `subscription_status` to
  `active` automatically. No cron job, no manual check-ins.
- Your cost stays at $0 the entire time someone is on trial or hasn't
  subscribed — Supabase, Twelve Data, and Vercel free tiers cover it. You
  only owe Dodo Payments their transaction fee once money actually comes in.

## What's intentionally not included (and why)

- **No brokerage/bank account connection (Plaid) yet.** Advisors enter
  holdings manually for now, which is zero-cost and needs no extra
  approval. Plaid is a natural v2 — it has its own signup and free
  development tier, add it once you have paying customers validating the
  core idea.
- **No automated trading or portfolio rebalancing.** That would require a
  broker-dealer relationship (e.g. Alpaca) and moves this from "reporting
  tool" into regulated territory. Out of scope by design.
- **No PDF library.** The report page uses the browser's own
  print-to-PDF, which is free, has zero dependencies to break, and looks
  clean. If you want a nicer generated PDF later, that's a good paid-tier
  upsell to build.
