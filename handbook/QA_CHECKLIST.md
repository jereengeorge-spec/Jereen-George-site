# QA Checklist — the two flows that matter

Walk this before any launch, after any auth/billing change, and before handing a
free account to a partner's client. It covers the caregiver→senior link and the
scam-alert loop end to end.

**You need two devices** (or one device plus a private/incognito window). The
senior's session and the caregiver's session cannot share a browser profile —
they're different logged-in identities.

Legend: ⬜ not run · ✅ pass · ❌ fail (note what happened)

---

## A. Caregiver signup and access

| # | Step | Expected | ⬜ |
|---|---|---|---|
| A1 | Sign up at `/signup` | Stripe Checkout opens immediately | ⬜ |
| A2 | Abandon checkout, then visit `/app` | **Blocked.** `subscription_status` stays `none` — an abandoned checkout must never grant access | ⬜ |
| A3 | Complete checkout | Redirected to `/app?trial_started=1` | ⬜ |
| A4 | Check Stripe → Payments | A **$25** PaymentIntent, "TechButler trial deposit" | ⬜ |
| A5 | Check Stripe → the subscription | Status `trialing`, and a **$25-off "once" coupon attached** | ⬜ |
| A6 | Check Supabase `profiles` | `subscription_status = trialing`, `deposit_status = paid` | ⬜ |

> ⚠️ If A5 fails, the day-8 invoice charges **$99 instead of $74**. The code
> catches that error non-fatally and only logs it — it will not announce itself.

## B. Linking a senior

| # | Step | Expected | ⬜ |
|---|---|---|---|
| B1 | `/app/seniors/new` — add a senior **with email and phone** | Saved, appears on `/app` | ⬜ |
| B2 | Open the senior, click **Generate setup link** | A `/setup/<uuid>` URL, copyable | ⬜ |
| B3 | Senior detail page before use | Shows "Not set up yet" | ⬜ |
| B4 | Open the link **on the second device** | Auto signs in, no password, lands on `/me/welcome` | ⬜ |
| B5 | Reload `/app/seniors/<id>` as caregiver | Now "✅ Set up — they can sign in themselves" | ⬜ |
| B6 | **Open the same link a second time** | **Rejected** — "This link has expired". One-time use | ⬜ |
| B7 | Wait 30+ min with an unused link, then open it | Rejected — tokens expire in 30 minutes | ⬜ |
| B8 | Add a senior with **no email**, generate a link, open it | "Setup incomplete" — asks family to add an email | ⬜ |
| B9 | Senior closes and reopens the app | Still signed in — session persists, no re-link needed | ⬜ |

## C. The senior's own screen (`/me`)

| # | Step | Expected | ⬜ |
|---|---|---|---|
| C1 | Senior sees their home screen | Greeted by name, assistant chat present | ⬜ |
| C2 | Ask the assistant a question | Responds; voice input available by default | ⬜ |
| C3 | Tap **Get a real human** | Confirmation shown; caregiver gets an email; ticket appears in `/founder/tickets` | ⬜ |
| C4 | Senior visits `/app` directly in the URL bar | **Must not** show the caregiver dashboard or a paywall screen | ⬜ |
| C5 | Caregiver cancels/lapses their subscription, senior reloads `/me` | "Almost ready" message — the senior's access rides on the owner's plan | ⬜ |

## D. Senior feedback *(added 2026-08 — was missing entirely)*

| # | Step | Expected | ⬜ |
|---|---|---|---|
| D1 | Senior scrolls `/me` | **"How is this going for you?"** card is visible | ⬜ |
| D2 | Type a note → Send | "Thank you, <name> 💙" confirmation | ⬜ |
| D3 | Tap **Record a message**, speak, tap Stop | Uploads; same confirmation | ⬜ |
| D4 | Deny microphone permission, then record | Friendly error — not a crash or a silent no-op | ⬜ |
| D5 | Founder opens `/founder` → Feedback | Both notes present, tagged **SENIOR**, showing the senior's **name** (not a raw email) | ⬜ |
| D6 | Audio note on the founder dashboard | Plays inline | ⬜ |
| D7 | Caregiver leaves feedback via the corner widget | Appears **without** the SENIOR tag — the two are distinguishable | ⬜ |

## E. Scam alert — the highest-stakes path

| # | Step | Expected | ⬜ |
|---|---|---|---|
| E1 | Senior taps **🚨 I think I'm being scammed** | Green "Your family has been notified 💙" | ⬜ |
| E2 | Caregiver's inbox | Email: "🚨 \<name\> may be getting scammed right now", with the senior's phone number | ⬜ |
| E3 | Caregiver opens `/app` | Red alert banner visible | ⬜ |
| E4 | Open the senior's detail page | Red card, timestamp, **📞 Call \<name\> now** one-tap button, 5-step what-to-say checklist | ⬜ |
| E5 | Tap the call button on a phone | Dials the saved number | ⬜ |
| E6 | Senior taps the alert button **again** | Raises a **second** alert — never disabled after first use. A scam escalates | ⬜ |
| E7 | Caregiver clicks **✓ Mark as handled** | Banner clears from both dashboard and detail page | ⬜ |
| E8 | Senior with **no phone saved** raises an alert | Card explains no number is saved and prompts the caregiver to add one | ⬜ |
| E9 | Break email delivery (bad `RESEND_API_KEY`), raise an alert | Senior sees the amber **"We're getting help to you"** message — *not* a false "family notified" | ⬜ |

> E9 is the one people skip and the one that matters most. The system must never
> tell a frightened person their family knows when no message actually went out.

## F. Founder console

| # | Step | Expected | ⬜ |
|---|---|---|---|
| F1 | Founder email loads `/founder` | Dashboard renders | ⬜ |
| F2 | **Non-founder** account visits `/founder` | Redirected to `/app` | ⬜ |
| F3 | Signed-out visit to `/founder` | Redirected to `/login` | ⬜ |
| F4 | MRR figure | Matches active subscriptions in Stripe | ⬜ |
| F5 | Escalation panel | Average resolution hours and oldest open ticket both populate | ⬜ |

---

## Re-running the senior flow

Setup links are single-use, so to re-test: open the senior's page as the
caregiver and use **Re-send setup** (`RegenerateSetupButton`). It clears
`senior_user_id` and issues a fresh token, so the whole flow runs clean again.

## Using the Claude Chrome extension for this

The extension can drive the browser through these steps and report what it sees,
which is useful for B, C, D, and F. Two cautions:

1. **It cannot verify email delivery** (E2, E9) or Stripe's internal state
   (A4–A6). Check those by hand — they're where the expensive failures hide.
2. **Have it read back what's on screen** rather than asking "did it work?" A
   pass/fail question invites a confident wrong answer; "what does this page
   say?" doesn't.

## What could not be automated here

The app can't be run in the build environment — Supabase, Stripe, and Anthropic
keys live in Vercel, not the repo, so there's no way to boot it and click
through. Everything above was verified by reading the source; the checkboxes
are the part that needs a real browser and a real inbox.
