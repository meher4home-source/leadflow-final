# Ledgerline: audit, changes and launch plan

Based on the files I received: `app.html`, `demo.html`, `index.html`, `check.html`, `checkout.js`, `README.md`.
**Not received, so NOT audited:** `schema.sql`, `api/dodo-webhook.js`, `config.js`, `vercel.json`, `terms`, `privacy`, the portal page. I could not open the live site or the database.

## 1. Existing application audit
**Working** (confirmed in code; I opened all 26 screens and all 30 tools in a test run: no JS errors, no NaN or undefined):
invoices, cash book, financial statements, recurring entries and invoices, tax summary, bank reconciliation (CSV), client report, share-with-client link, insights, deadlines calendar, inventory, purchases, fixed assets, projects, customers, marketing, employees, loans, investments, insurance, branding, saved documents (5 MB per file), 30 accounting tools, CSV and JSON export, client workspaces (50 per pack), referral link.

**Partly working / depends on setup:**
- Automatic overdue-invoice emails: only if Resend keys are set (README). The app now shows this as "not available yet" unless `REMINDERS:true` is in `config.js`.
- Payments: depends on Dodo products and webhook. Not testable by me.
- Yearly billing: depends on yearly Dodo products existing.

**Not built:** bank feeds, team logins, GST/TDS filing, legal e-signatures, central admin dashboard, role-based access, audit logs, bulk onboarding, SLA tooling, automatic free-tier usage warnings (Supabase does not expose usage to the browser; check Dashboard > Usage monthly).

## 2. Changes made
- Removed or corrected false or misleading text (reminders, "coming soon" contradictions, "sign-off", "Pay yearly and save", ROI calculator defaults, payroll wording).
- Pricing table now matches the app's own price list and plan contents.
- Positioning changed to "Online bookkeeping software for businesses, accountants and institutional partners".
- 3D skin on all pages; new logo.
- No existing feature or database structure was removed or changed.

## 3. New pages and features
Home, Accountants, Enterprise, Partners, Government, Pricing, Contact (with working enquiry form), and `templates.html` (operator-only: subscription proposal, bulk quotation, paid pilot proposal, subscription agreement, invoice, partnership proposal; print to PDF).
Business details and prices live in `site-config.js`. Enquiries go to one new table (`enquiries.sql`). If the form cannot save, it says so plainly and offers an email link. It never shows "sent" unless the database confirmed it.

## 4. Still not built
See section 1 "Not built". The Enterprise page lists these openly as "not built yet".

## 5. Actual operating cost
| Item | Today | When you charge customers |
|---|---|---|
| Vercel | Hobby: $0 | **Hobby is non-commercial only. Selling on it breaks Vercel's terms.** Pro is about $20/month (check vercel.com/pricing) |
| Supabase | Free: $0 | Free works but see section 6. Pro is $25/month |
| Dodo Payments | no monthly fee I know of | per-sale fee. Check current rate on their site |
| Domain | `.vercel.app` free | custom domain optional, yearly cost |
| Resend, Turnstile | free tiers | only if you switch reminders or CAPTCHA on |

**Zero-cost is not possible while taking payments on Vercel.** Two honest options: (a) take the first advance payment, then buy Vercel Pro; (b) move to Cloudflare Pages (free plan, check its commercial terms). Option (b) means rewriting `api/checkout.js` and `api/dodo-webhook.js`, and I have not done that.

## 6. Free-tier limits (checked online, July to September 2026 sources)
Supabase Free: 500 MB database, 1 GB file storage (all customers' documents share this), 5 GB egress, 50,000 monthly users, **auto-pause after 7 days of no activity, no daily backups**. Pro ($25/month) removes the pause and adds daily backups.
Until you upgrade: take a manual export of the database every week, and do not sign a contract that promises uptime or backups.

## 7. Security gaps
1. **Row-level security and the schema are unreviewed.** Before any paid customer, confirm each table has RLS so one customer can never read another's rows. This is the most important check.
2. Trial expiry and plan limits may only be enforced in the browser. I could not see the server side.
3. Enquiry form: honeypot, length limits and a 1-per-minute browser check only. A script can bypass them. Cloudflare Turnstile (free) is not wired in.
4. `check.html` is public and tells visitors what is misconfigured. Delete it after launch (README says so).
5. `terms` and `privacy` pages should be updated to mention enquiry data. I did not see them.
6. Referral credit is manual.
7. The Firm pack selector in the app goes up to 500 clients (10 packs); checkout allows 1,000.

## 8. Pricing: a mismatch you must resolve before publishing bulk prices
Your self-serve Accountant plan: ₹4,999/month per 50 clients = **₹59,988/year per 50 workspaces = about ₹1,200 per workspace per year.**
Your proposed bulk prices per business per year: 100 for ₹2 lakh = ₹2,000; 500 for ₹8 lakh = ₹1,600; 1,000 for ₹15 lakh = ₹1,500.
So a CA can buy 100 workspaces online for ₹1.2 lakh a year, cheaper than your ₹2 lakh "bulk" price. Bulk prices only make sense if each business gets **its own login** (Business plan is ₹17,988/year each, so ₹2,000 is a very large discount), or if the bulk price includes paid onboarding or support.
The ₹15,000 pilot equals 3 months of one 50-client pack (₹14,997), so a pilot that covers only 25 businesses is priced the same as the online pack.
**Decision for you:** define what a "business" is in a bulk licence (workspace under one login, or its own login) and what extra you provide. Until then, `showBulkPrices` stays `false` and the site says "priced by written quotation". Your proposed numbers are saved in `site-config.js`, unpublished.
Also: fulfilling bulk licences is manual today (you activate accounts after payment). That is fine for a 25-business pilot and will not scale to 1,000 without admin tooling. Verify column names against `schema.sql` before running any SQL on `profiles`.

## 9. Steps to start selling
1. Run `enquiries.sql` in Supabase > SQL Editor.
2. Upload all new files to the repo root (pages, `site.css`, `site.js`, `site-config.js`, `fx.css`, `fx.js`, `img/`, `logo.svg`, `app.html`). Keep `config.js` and `api/`.
3. Fill `site-config.js` (email, name, jurisdiction). Add registrations only when you hold them.
4. Open `/check`, then test: sign up, add an invoice, send a contact enquiry, read it in Supabase > Table Editor.
5. Verify RLS (section 7, item 1).
6. Decide hosting (section 5). Do not take customer payments on Hobby.
7. Settle the bulk price structure (section 8), then set `showBulkPrices`.
8. Approach your first buyers: CA and bookkeeping firms, with a paid pilot. Use `templates.html`, have a lawyer review the agreement, ask a CA about GST registration before invoicing.

## 10. Future enterprise requirements (do not advertise until built)
Multi-tenant organisation dashboard, roles, audit logs, bulk onboarding, licence and usage screens, backups and recovery, uptime and support targets, security review. Build only after a paying contract asks for it. Government: DPIIT recognition needs a registered company, LLP or partnership, not a proprietorship; GeM needs its own documents. Verify each on the official portals before you bid.
