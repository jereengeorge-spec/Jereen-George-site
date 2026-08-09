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

> ✅ **Considered and rejected (2026-08):** a $79/mo "Family" + $149/mo "Concierge"
> two-tier structure — the engagement's original draft pricing — was proposed again and
> evaluated against the single-plan model above. **Decision: keep one plan, $99/mo or
> $999/yr.** Do not resurface this without new information; the reasoning below is why it
> was closed, not just noted as stale.
>
> 1. **Contradicts the affluent-market positioning.** $79 is a step *down* from $99, not
>    up — working against the deliberate move toward a higher-income buyer (§2).
> 2. **Reopens the price-comparison problem instead of closing it.** One price keeps the
>    pitch on outcome. Two tiers invite "what do I get for $79 vs $149?", dragging the
>    conversation back into feature-for-feature territory — exactly where a $228/yr
>    competitor wins (§4).
> 3. **Multiplies buyer decisions.** One plan means one decision: trial or don't. A second
>    tier adds a second decision point at exactly the moment — an emotional, safety-driven
>    purchase — where added friction costs the most conversions.
> 4. **Breaks the annual-first CAC math.** A $79/mo entry tier caps viable CAC at roughly
>    $27 — tighter than even the $99/mo default's $37 ceiling — while $999 collected
>    upfront raises it to ~$487, the number that actually makes paid ads viable (§3). A
>    cheaper entry tier moves in the wrong direction on the one lever that unlocks that
>    channel.
>
> A tier *above* $99 (priority human response, coverage for 2 seniors) may be worth adding
> once there's real usage data — the rejection is of a cheaper entry point, not of tiering
> as a concept ever.
>
> This was also stale documentation drift: `docs/PROJECT_PLAN.md` §5 in the app repo
> proposed the same $79/$149 structure as an unresolved draft. **Fixed 2026-08** — that
> section now shows the confirmed $99/$999 pricing with the rejection reasoning preserved
> in a collapsed note, and the open question in §8 is marked resolved.

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
