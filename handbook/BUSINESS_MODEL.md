# TechButler — Business Model

**Source of truth for what the business is, who buys it, and how it makes money.**
If this doc and any other doc disagree, this one wins — except where the *shipped code*
disagrees with this doc, in which case the code wins and this doc is the bug.

Last verified against the codebase: 2026-08-09.

---

## 1. The business in one paragraph

A subscription that becomes an aging parent's tech support, sold to their adult child so
that child stops being the family's unpaid, on-call IT department. An AI companion named
**George** handles the day-to-day (voice-first, patient, scam-aware); a human — currently
the founder — handles escalations. The adult child owns the account and sees a dashboard;
the senior is a managed profile, not a dashboard user.

**Pitch line:** *"Stop being your family's tech support."*
**Channel identity:** *"For the Family IT Department."*

---

## 2. Who buys, who uses

| | Buyer | User |
|---|---|---|
| Who | Adult child, **35–65** | Their parent, 70+ |
| Income | **$150k+ household** — the offer is income-qualified, not price-competitive | n/a |
| Situation | Lives 30+ min from the parent (distance is what stops "I'll just drive over") | Lives independently |
| Emotional driver | Fear of a scam · guilt · exhaustion from repeat calls | Embarrassment at asking; wants independence |
| What they buy | **Not getting the call.** Peace of mind. | Someone patient who never makes them feel stupid |

**Second buyer, currently unaddressed:** affluent **65–75-year-olds buying for a spouse or
themselves.** Online, moneyed, embarrassed to keep asking their kids, and nobody is
selling to them. Same product, different script — dignity and independence rather than
relief and guilt.

Elder fraud runs $1B+/year for age 60+, with roughly 2 in 3 people over 70 targeted.
That is the fear the product sells against.

---

## 3. Price and unit economics

**Shipped price (authoritative — `src/lib/stripe.ts`): one plan, two cycles.**

| Cycle | Price | Trial mechanics |
|---|---|---|
| Monthly | **$99/mo** | $25 today → 7-day trial → **$74** on day 8 → $99/mo recurring |
| Annual | **$999/yr** | $25 today → 7-day trial → **$974** on day 8 → $999/yr recurring |

Annual saves $189 (16.7% — the standard "2 months free" discount).
There is also a **buy-in-full** path that skips the trial and charges the full price today.

> ⚠️ **Known doc drift:** `docs/PROJECT_PLAN.md` §5 still proposes a two-tier
> $79/$149 model. That was never shipped and was superseded in 2026-06. The code is
> correct; PROJECT_PLAN §5 is stale and should be struck.

**Assumed COGS: ~$25/customer/month** (Anthropic API + the founder's share of human
escalation time). Revisit once there are 20+ customers and real usage data.

| Cycle | Revenue/mo | Gross profit/mo |
|---|---|---|
| $99/mo | $99 | **$74** |
| $999/yr | $83.25 | **$58** |

### Customers required to replace income

| Target income | Monthly GP needed | On $99/mo | On $999/yr |
|---|---|---|---|
| $60,000 | $5,000 | 68 | 86 |
| $100,000 | $8,333 | 113 | 143 |
| $150,000 | $12,500 | 169 | 215 |
| $200,000 | $16,667 | 225 | 286 |

**The whole business is ~150 customers.** Not an audience, not virality — roughly 150
affluent families. At ~6%/month churn, holding 113 means replacing ~7/month; reaching
113 within a year means landing **3–4 new customers per week**. That number determines
the entire channel strategy in [`GROWTH_MODEL.md`](../marketing/GROWTH_MODEL.md).

### The money-model constraint

Hormozi's client-financed acquisition rule: **30-day gross profit > 2 × CAC.**

| Offer shape | 30-day cash | Max viable CAC | Verdict |
|---|---|---|---|
| Monthly-first (current default) | $99 | **$37** | Paid ads impossible |
| **Annual-first** ($999 upfront) | $999 | **~$487** | Paid ads viable |

Making annual the *default* rather than the alternative is the single highest-leverage
change available, and it does not require touching the price. It is the gate on the
entire paid-acquisition phase.

---

## 4. Competitive position

| Service | Price | Model |
|---|---|---|
| HelloTech (remote-only) | **$99/yr** | Human, on-demand |
| Best Buy Total | **$180/yr** | Human + retail perks |
| Candoo Tech | **$228/yr** single · **$340/yr** couple | Human, senior-specialist |
| Candoo one-off | $75/session | Human |
| **TechButler** | **$1,188/yr** | AI 24/7 + human escalation + family dashboard |

TechButler is **3.5×–12× the market.** Holding that price is a deliberate call, and it
forces one rule:

> **Never market TechButler as "unlimited tech support for seniors."**
> Candoo sells exactly that, human-delivered, for $228/yr. On that framing we lose on
> price and lose again on "a human beats an AI."

The premium must rest on what the cheap options structurally cannot do:

1. **24/7, zero-wait.** Competitors are appointment-based. George answers at 11pm Sunday.
2. **The buyer's outcome, not the user's.** They sell help *to the senior*. We sell
   *"you stop getting the call"* to the adult child. Different product, different buyer,
   higher ceiling.
3. **The family dashboard.** Nobody at $228/yr shows you how your mother is actually doing.
4. **Proactive scam prevention.** Not "we fix it after" — "we stopped it before."
   Insurance framing carries insurance pricing.

Market context: senior tech services is ~$4.6B in 2025 → ~$13.8B by 2035 (11.5% CAGR),
and subscriptions are already 52.5% of revenue. The category is moving our way.

---

## 5. Product

**V1 (shipped):** AI assistant (Claude) · "I'm stuck — get a human" escalation to the
founder queue · adult-child dashboard · managed senior profiles · scam alerts (AI-detected
and senior-triggered) · 7-day trial behind a Stripe paywall · founder dashboard.

**V1.5 (planned):** see `docs/ACCURACY_AND_V1.5_ROADMAP.md` in the app repo.

**V2 (planned):** an 800-number for live human phone support, routed via Twilio and logged
into the same support history. See `docs/V2_PHONE.md`.

---

## 6. Open risks

| Risk | Status | Notes |
|---|---|---|
| **Brand name** | 🔴 Unresolved | "TechButler" is a registered trademark with active competitors in this exact niche; good domains are largely taken. `docs/NAMING.md` rates it high-risk and proposes Carson / Hudson / Pennyworth / Reggie. Everything reads from `src/lib/brand.ts`, so the swap is one file — but it gets more expensive every video published under the current name. |
| **Price vs. market** | 🟡 Accepted | 3.5–12× competitors. Mitigated by positioning (§4), not by discounting. Decision is to hold. |
| **Founder is the escalation queue** | 🟡 Known | Human escalation is one person. Fine to ~50 customers; a hiring or automation plan is needed before 150. |
| **Single-channel dependency** | 🟡 Open | Organic content takes 60–90 days to produce inbound. Partnerships (see GROWTH_MODEL §3) are the hedge. |
| **Doc drift** | 🟠 Active | PROJECT_PLAN §5 pricing is stale (see §3). Treat *this* handbook as canonical. |

---

## Related documents

- [`../marketing/GROWTH_MODEL.md`](../marketing/GROWTH_MODEL.md) — which channel, and the math behind it
- [`../marketing/PLAYBOOK.md`](../marketing/PLAYBOOK.md) — how to produce the content
- [`OPERATIONS.md`](OPERATIONS.md) — the operating rhythms and runbooks
- [`CRM.md`](CRM.md) — what the CRM is and what it's missing
