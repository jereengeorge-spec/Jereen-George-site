# Operations Manual

Every recurring system: the rhythms that run the week, the procedures for the things
that happen repeatedly, the runbooks for the things that go wrong, and the access
inventory that makes a handoff possible.

Written so that someone who has never seen this business can run it from this page.

---

## 1. Operating rhythms

### Daily (~90 min)

| Block | What | Where |
|---|---|---|
| **Escalation sweep** — twice, morning and evening | Clear open human escalations. Nothing else comes first: response time is the product. | `/founder/tickets` |
| **Scam alerts** — on notification, immediately | Any open `scam_alert` is treated as urgent regardless of hour. | `/founder` |
| **Rule of 100** | 100 outreach touches **or** 100 minutes of content. Every weekday, no exceptions. | `/founder/pipeline` *(once built)* |
| **Pipeline due list** | Every lead or partner whose `next_action_at` has passed. | `/founder/pipeline` |
| **Comment replies** | Reply to every comment on the last 2 hours of posts. Past 2 hours: still growing → keep going; flat → stop. | Social platforms |

### Weekly (~60 min, same slot each week)

1. **Numbers.** Record the seven tracked metrics (§2). Same day, same time, always.
2. **Pipeline review.** Every lead in `contacted` or `qualified` gets a next action or a
   `lost_reason`. No lead may sit dateless.
3. **Partner review.** Every `active` partner gets a touch. Every `prospect` gets a
   first approach or is dropped.
4. **Content batch.** Produce the coming week's videos in one sitting via the
   `ai-clone` pipeline. Batching beats daily production.
5. **Backup.** Export the Supabase tables (§4).

### Monthly (~2 hrs)

1. **Cohort check.** Trial → paid conversion, and churn by signup month.
2. **Channel attribution.** MRR split by `leads.source`. Double down on the winner; this
   is the decision the whole growth model waits on.
3. **COGS reality check.** Actual Anthropic spend ÷ active customers. The $25/customer
   assumption in [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md) §3 drives every CAC ceiling —
   if it is wrong, the ad math is wrong.
4. **Stripe reconciliation.** Failed deposits, involuntary churn, disputes.
5. **Handbook update.** Anything that changed goes in here the same day it changes.

---

## 2. The tracked metrics

Recorded weekly, same seven, forever:

| Metric | Source | Why |
|---|---|---|
| Conversations had | `touches` | Rule of 100 compliance |
| Partners signed | `partners` where `status = 'active'` | The leading indicator of the fastest channel |
| Videos posted | Content log | Output beats perfection — 25 in 32 days beats 11 in 100 |
| Leads captured | `leads` | Top of funnel |
| Trials started | `profiles` where `subscription_status = 'trialing'` | Offer is working |
| **Paying customers** | `profiles` where `subscription_status = 'active'` | **The only number that is real** |
| **Churn** | canceled ÷ prior-month active | The one that quietly kills it |

The last two are outcomes. The first five are leading indicators — useful for diagnosing
*why* the outcomes moved, never a substitute for them.

**Target:** ~150 paying customers ≈ income replacement. At 6% monthly churn that means
3–4 net new per week. See [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md) §3.

---

## 3. Standard procedures

### SOP-1 · Human escalation
1. Alert arrives by email (`FOUNDER_ALERT_EMAIL`, sent via Resend).
2. Open the ticket at `/founder/tickets/[id]` and read the AI transcript first — the
   customer has already explained the problem once and should never have to repeat it.
3. Contact the customer directly. **Target: under 2 hours during waking hours.**
4. Log what happened with `addTicketNote` — notes are founder-private, in `ticket_notes`.
5. Mark resolved. This stamps `resolved_at` and feeds the average-resolution metric.

> Avg resolution time and oldest-open-ticket are both on `/founder`. At $99/mo against
> $228/yr competitors, response speed *is* the premium being charged for.

### SOP-2 · Scam alert
1. Fires from George detecting a pattern mid-conversation, or the senior pressing their
   own SOS button on `/me`.
2. The system emails **the account owner** (the adult child), not the founder, and shows
   a banner on their `/app` dashboard.
3. Founder action: confirm the owner responded. If no response within an hour on an open
   alert, contact them directly.
4. Mark `handled`.

This is the single most brand-defining interaction in the product. It is the thing the
subscription is really being bought for.

### SOP-3 · New customer onboarding
1. Signup → Stripe Checkout opens immediately. **No access until the webhook confirms** —
   `subscription_status` defaults to `none` deliberately, so an abandoned checkout never
   yields free access.
2. Webhook sets `trialing`, charges the $25 deposit, attaches the day-8 coupon.
3. Confirm `deposit_status = 'paid'` on the profile. If `failed`, see RUN-4.
4. Founder sends a personal welcome within 24 hours. At this scale, every customer gets
   a human hello — it is the cheapest retention available.
5. Confirm they have added at least one senior. **An owner with zero seniors will churn.**

### SOP-4 · Working a referral partner
1. Add to `partners` with a category and a `next_action_at`.
2. First approach leads with *their* problem, not ours: their clients keep asking them for
   tech help they do not want to give.
3. Give before asking — the scam-proof checklist lead magnet is something they can hand
   to their own clients with their own name on it.
4. Log every contact in `touches`.
5. On `active`: agree how referrals arrive, and make sure those leads get
   `source = 'partner'` and the right `partner_id`, or attribution is lost.

### SOP-5 · Producing a video
Full detail in [`../marketing/PLAYBOOK.md`](../marketing/PLAYBOOK.md). Short form:
pick the next scriptbook entry → `node ai-clone/run.mjs content/<file>.json` → check the
render → post → reply to comments for 2 hours → log the numbers.

**Locked format decisions:** faceless · mascot is **George** (same name as the in-product
AI, so every video is also a product demo) · founder appears as a name and a voice, never
a face.

---

## 4. Runbooks

### RUN-1 · Deploy
Vercel, on push. Full procedure in the app repo's `docs/DEPLOYMENT.md`. Environment
variables are set in Vercel, never committed.

### RUN-2 · Stripe test → live
Six values must change together. Swapping only the keys is the standard failure.

| Variable | Live value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` |
| `STRIPE_PRICE_MAIN` | **new** live-mode price ID ($99/mo) |
| `STRIPE_PRICE_ANNUAL` | **new** live-mode price ID ($999/yr) |
| `STRIPE_COUPON_FIRST_MONTH` | **new** live-mode coupon ID ($25 off, once) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from a **new** live-mode endpoint |

Products, prices, coupons, and webhook endpoints are separate objects in test and live —
**none of those IDs carry over.**

**Verify:** start a signup on the live site and look at Stripe Checkout. Test mode paints
an orange **TEST MODE** banner. No banner = live. This proves the *deployed app* is live,
which reading dashboard settings does not.

Also confirm the Stripe **account itself is activated** (business details + bank account).
Without activation, live keys do not exist at all.

**Three ways a half-switched config fails silently** — all verified in the code:

- `src/lib/stripe.ts:6` falls back to `"sk_test_placeholder_set_real_key"`, and
  `billing/actions.ts:23` returns early when the key is missing. A missing key yields a
  checkout button that does nothing — no crash, no error.
- `ANNUAL_ENABLED = !!process.env.STRIPE_PRICE_ANNUAL` (`stripe.ts:48`) — if the annual
  price was not recreated in live mode, **the annual option vanishes from the UI and every
  checkout silently falls back to monthly.** Given that annual-first is the highest-leverage
  change in the growth model, this is expensive and gives no signal.
- `webhook/route.ts:22–28` attaches the day-8 coupon inside a try/catch logging
  `"Failed to attach day-8 coupon (non-fatal)"`. A test-mode coupon ID against a live key
  fails there and **the customer is charged the full $99 on day 8 instead of $74** — a
  silent overcharge visible only in server logs.

### RUN-3 · Webhook not firing
Symptoms: signups stuck at `subscription_status = 'none'`, no $25 deposits, no coupons.
1. Stripe → Developers → Webhooks (**live** mode). Confirm an endpoint at
   `https://techbutler.app/api/stripe/webhook`.
2. Confirm all four events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `payment_intent.payment_failed`.
3. Check recent deliveries for 200s. Signature failures mean `STRIPE_WEBHOOK_SECRET` does
   not match this endpoint.
4. Stripe retries, so fixing the secret recovers pending events.

### RUN-4 · Deposit failed (`deposit_status = 'failed'`)
Usually a card requiring 3D Secure, which cannot complete off-session. `/app/billing`
prompts the customer to update their payment method. Deposits are idempotency-keyed on the
subscription ID (`tb_deposit_<sub.id>`), so a webhook retry returns the original
PaymentIntent and never double-charges.

### RUN-5 · Data loss / restore
Supabase is the only copy of every customer record. Weekly export (§below) is the entire
disaster-recovery plan. Restore = create a project, run `supabase/schema.sql`, run the
migrations, import the CSVs.

**Weekly backup:** Supabase → SQL editor → export each of `profiles`, `seniors`,
`support_requests`, `ticket_notes`, `scam_alerts`, `leads`, `feedback` (plus `partners`,
`lead_notes`, `touches` once added). Store outside Supabase.

---

## 5. Access inventory & handoff

**Never record credential values here or anywhere in a repository.** This is an inventory
of *which* accounts exist and who must hold them — the values live in a password manager.

| System | Purpose | Where its config lives |
|---|---|---|
| **Vercel** | Hosting, all production env vars | Vercel → Project → Settings → Environment Variables |
| **Supabase** | Auth + Postgres + Storage. The only copy of customer data | Supabase dashboard |
| **Stripe** | Payments, subscriptions, webhook | Stripe dashboard (live mode) |
| **Anthropic** | Powers George | console.anthropic.com |
| **Resend** | Founder alert emails | resend.com |
| **Domain registrar** | `techbutler.app` DNS | Registrar |
| **GitHub** | `jereengeorge-spec/techbutler.app`, `jereengeorge-spec/Jereen-George-site` | GitHub |
| **Social accounts** | Distribution | Per platform |

### Founder access is one environment variable

`FOUNDER_EMAILS` (comma-separated) is the entire permission model for `/founder`. To grant
someone founder access: add their email, redeploy. To revoke: remove it, redeploy.

**There are no roles and no audit log.** Anyone in `FOUNDER_EMAILS` sees all revenue, all
customers, every support transcript, and every senior's details. Grant it deliberately.

### Handoff checklist

- [ ] Add the successor's email to `FOUNDER_EMAILS`; redeploy; confirm `/founder` loads
- [ ] Transfer or share: Vercel, Supabase, Stripe, Anthropic, Resend, registrar, GitHub
- [ ] Move all credentials into a shared password manager vault
- [ ] Walk through SOP-1 and SOP-2 live on a real ticket — response time is the product
- [ ] Hand over this handbook and confirm they can reach the founder console
- [ ] Fresh Supabase export handed over
- [ ] Confirm they can run the video pipeline (`ai-clone/run.mjs`)
- [ ] Introduce them to every `active` partner personally — partnerships are relationships,
      and they do not transfer through a database row
- [ ] Remove the departing person's email from `FOUNDER_EMAILS`; redeploy; rotate every
      shared secret

---

## Related documents

- [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md) — what the business is and the unit economics
- [`CRM.md`](CRM.md) — the CRM map and the acquisition-pipeline gap
- [`../marketing/GROWTH_MODEL.md`](../marketing/GROWTH_MODEL.md) — channel strategy
- [`../marketing/PLAYBOOK.md`](../marketing/PLAYBOOK.md) — content production
