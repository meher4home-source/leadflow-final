# LeadFlow AI — Setup & Deploy Guide

Design: light theme, dark navy sidebar (matches your reference screenshots).
Terminology: High-Paying Lead / Mid-Range Lead / Low-Budget Lead — no Hot/Warm/Cold anywhere.
Features: Dashboard, All Leads, Calls & WhatsApp, Settings — Properties/Employees/Social-Media
were intentionally left out since they only fit real estate and would clutter the app for your
other 11 industries.

---

## Step 1 — Supabase (Free)

1. https://supabase.com → New Project
2. SQL Editor → paste all of `supabase_schema.sql` → Run
3. Project Settings → API → copy:
   - Project URL and `anon` key → open `auth.js`, replace `YOUR_SUPABASE_URL` and
     `YOUR_SUPABASE_ANON_KEY` at the top with these real values
   - `service_role` key (secret) → save for Step 6's environment variables
4. **Google Sign-In:** Google Cloud Console → Credentials → OAuth Client ID (Web) →
   Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   → paste the Client ID/Secret into Supabase Dashboard → Authentication → Providers → Google
5. Authentication → URL Configuration → set Site URL and Redirect URLs to your Vercel domain
   once deployed (Step 8)

## Step 2 — NVIDIA API Key (Free)

https://build.nvidia.com → get an API key → `NVIDIA_API_KEY`.

## Step 3 — Twilio (SMS, Calls, WhatsApp)

1. https://twilio.com → buy a phone number (supports SMS + Voice)
2. Copy Account SID, Auth Token, phone number → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_PHONE_NUMBER`
3. **WhatsApp:** Twilio Console → Messaging → Try WhatsApp (sandbox for testing) or apply for a
   WhatsApp Business Sender for production → the approved number goes in `TWILIO_WHATSAPP_NUMBER`
4. **After deploying (Step 8):** in the Twilio Console, your phone number's settings →
   Messaging → "A message comes in" webhook → `https://your-domain.vercel.app/api/sms/webhook`
   (HTTP POST) — this is what lets lead replies continue the AI conversation

## Step 4 — Dodo Payments

1. https://dodopayments.com → sign up (Merchant of Record — requires business approval)
2. Dashboard → Products → create **two** recurring products:
   - "LeadFlow Standard" — $1,997/month → Product ID → `DODO_PRODUCT_STANDARD`
   - "LeadFlow Multi-Location" — $4,997/month → Product ID → `DODO_PRODUCT_MULTILOCATION`
3. Settings → API → copy API key → `DODO_PAYMENTS_API_KEY`
4. Settings → Webhooks → new endpoint (real URL after Step 8):
   `https://your-domain.vercel.app/api/payments/webhook`
   Subscribe to: `subscription.active`, `subscription.renewed`, `subscription.cancelled`,
   `subscription.expired`, `subscription.failed`, `payment.succeeded`
   → signing secret → `DODO_PAYMENTS_WEBHOOK_KEY`
5. Use `DODO_PAYMENTS_ENVIRONMENT=test_mode` while testing (test card `4242 4242 4242 4242`,
   any future date/CVV), switch to `live_mode` when ready

## Step 5 — Push to GitHub

```bash
cd leadflow-ai
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/leadflow-ai.git
git push -u origin main
```

## Step 6 — Deploy to Vercel

1. https://vercel.com → Add New Project → import your repo
2. Framework preset: **Other** (static site + serverless functions, not Next.js)
3. Environment Variables — add everything from `.env.example`
4. Deploy

## Step 7 — After Your First Deploy

- Copy your real Vercel URL, set `SITE_URL` to it, redeploy
- Go back and update: Supabase redirect URLs (Step 1.5), Twilio SMS webhook (Step 3.4), Dodo
  webhook URL (Step 4.4) with your real domain

---

## Test the Whole Flow (Don't Skip This)

1. Visit `/index.html` → "Get Started"
2. Sign up (try Google sign-in too) → pick an industry → enter business name + a Calendly link
3. On the pricing step, use Dodo's **test mode** card to subscribe
4. Land on `/dashboard.html` — if payment hasn't confirmed yet, a brief "confirming" wait
   (up to ~30 seconds) runs while the webhook arrives, then it unlocks
5. Settings tab → copy your intake URL — this is what you'd wire to a real client's contact form
6. "+ Add Lead" with your own phone number → you should get the first qualifying text within
   moments (requires Twilio) → reply and watch the conversation continue and classify
7. Calls & WhatsApp tab → try a test click-to-call and WhatsApp send with your own number

---

## What Was Simplified (So You Know What's Real vs. Not Yet Built)

- **Booking:** a Calendly-style link the business pastes in once — no custom Google Calendar
  OAuth integration
- **Classification logic** lives in the AI prompt (`lib/nvidia.js`) — review real conversations
  early and tighten the prompt based on what you see
- **WhatsApp** requires Twilio's WhatsApp approval process for production use (the sandbox
  works instantly for testing)
- Never claim "guaranteed" results to your own clients — keep language as "estimated" /
  "typical," for the same legal reasons discussed earlier

---

## Next Steps — Getting Your First Clients

1. **Pick one niche first** (roofing or real estate wholesalers) — don't launch to all
   industries at once
2. Use Google Maps + Hotfrog + Meta Ad Library (search "roof replacement," "we buy houses,"
   category "All ads") to build a list of 20-30 local businesses already spending on ads —
   they already value leads and have budget
3. Offer a free demo using their own missed-lead scenario: "text this number like one of your
   customers would — watch what happens"
4. Close your first 3-5 clients on the Standard plan, refine the qualifying questions based on
   real replies, then approach a trade association or local business group for warm referrals
5. Once you have 5-10 happy clients, start approaching multi-location/regional businesses in
   the same niche for the Multi-Location plan
