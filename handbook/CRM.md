# CRM — what it is, what it tracks, what it's missing

**There is no external CRM.** No HubSpot, Salesforce, Pipedrive, Airtable, Attio, or
Notion appears anywhere in the codebase — verified by search on 2026-08-09. What exists
is a **home-built founder console** at `/founder`, backed directly by Supabase Postgres.

That is a good thing for a business this size — no seat cost, no sync, no export
lock-in — but it means the CRM only does what someone wrote code for. This document is
the map of what's there and, more importantly, what isn't.

---

## 1. The system as built

**Access control:** the `FOUNDER_EMAILS` environment variable (comma-separated). Only
those addresses can load `/founder`. That single variable is the whole permission model —
see [`OPERATIONS.md`](OPERATIONS.md) §5 for the handoff implications.

### `/founder` — the console

| Panel | What it shows | Source |
|---|---|---|
| Revenue | MRR, active / trialing / canceled counts, annual-plan count | `profiles` |
| Conversion | active ÷ (active + canceled) | `profiles` |
| Trend | signups per month and MRR per month, last 6 months | `profiles` |
| Escalation health | open human escalations, **average resolution hours**, **oldest open ticket** | `support_requests` |
| Seniors | every managed senior, joined to their owner | `seniors` + `profiles` |
| Leads | inbound `/stuck` submissions | `leads` |
| Feedback | typed notes and recorded audio (signed URLs from the `feedback-audio` bucket) | `feedback` |
| Quick links | Supabase users / tables / SQL, Stripe, Vercel | derived from `NEXT_PUBLIC_SUPABASE_URL` |

### `/founder/tickets` — the work queue

The list plus a detail view per ticket. Two actions: `setTicketStatus(id, "open" \| "resolved")`
(stamps `resolved_at`) and `addTicketNote(id, text)`.

### The tables

| Table | Holds | Notable |
|---|---|---|
| `profiles` | Account owners (the adult children) | Carries `subscription_status`, `plan`, `stripe_customer_id`, `deposit_status` |
| `seniors` | Managed senior profiles | Optional `senior_user_id` for the lite `/me` login |
| `support_requests` | Every help interaction | `channel` = `ai` \| `human_escalation` \| `phone` (V2); `status` = open \| resolved; stores the AI transcript |
| `ticket_notes` | Founder-only notes on a ticket | **RLS enabled with no policies** — service-role only. Deliberately a separate table because `support_requests` grants the customer read access to *every column* of their own row |
| `scam_alerts` | Live scam events, AI-detected or senior-triggered | Emails the **owner**, not the founder; own table so "any open alerts?" is cheap to query |
| `leads` | Public `/stuck` submissions from non-customers | Service-role only |
| `feedback` | Product feedback, text or audio | Audio blobs in Supabase Storage |

The `ticket_notes` design — a separate, policy-less table rather than a column on the
customer-readable row — is the security pattern to copy for anything founder-private.
Any new internal field must follow it.

---

## 2. The gap that matters

**The CRM tracks delivery. It does not track acquisition.**

Every table above describes someone who has *already signed up*, plus one inbound form.
But [`../marketing/GROWTH_MODEL.md`](../marketing/GROWTH_MODEL.md) concludes the business
runs on **warm outreach and professional referral partnerships**, producing 3–4 new
customers a week. There is nowhere to record any of that.

The `leads` table is `name · email · phone · problem · created_at` — and nothing else:

- **No status.** New, contacted, qualified, won, lost — all indistinguishable.
- **No source.** A `/stuck` form fill and an elder-law attorney's referral look identical.
- **No next action or due date.** Nothing surfaces "you said you'd follow up Tuesday."
- **No partner concept at all.** The single highest-leverage channel in the growth model
  has no representation in the data model.
- **No outreach log.** Hormozi's Rule of 100 asks for 100 touches a day; there is no
  place to count one.

You cannot run a partnership-led acquisition motion on this. **This is the top-priority
build on the CRM.**

---

## 3. The fix

Small and additive — no changes to existing columns, so nothing already shipped breaks.
Follows the established `ticket_notes` security pattern for anything founder-private.

```sql
-- ── Acquisition pipeline ─────────────────────────────────────────────────────
-- Extends the existing leads table and adds the partner relationships that the
-- growth model runs on. Additive only: every new column is nullable or defaulted,
-- so existing /stuck inserts keep working untouched.

-- 1. Referral partners: elder-law attorneys, wealth managers, concierge medicine,
--    geriatric care managers, private-pay home care, senior communities, CPAs.
create table if not exists public.partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  org          text,
  category     text,                              -- 'elder_law' | 'wealth' | 'medical' | 'care_mgmt' | 'home_care' | 'community' | 'cpa' | 'other'
  email        text,
  phone        text,
  status       text not null default 'prospect',  -- prospect | contacted | meeting_set | active | dormant
  next_action  text,
  next_action_at timestamptz,
  created_at   timestamptz not null default now()
);
alter table public.partners enable row level security;  -- no policies = service role only

-- 2. Pipeline fields on leads.
alter table public.leads add column if not exists status         text not null default 'new';
  -- new | contacted | qualified | trial_started | won | lost
alter table public.leads add column if not exists source         text not null default 'stuck_form';
  -- stuck_form | warm_outreach | partner | content | paid_ad | referral
alter table public.leads add column if not exists partner_id     uuid references public.partners(id) on delete set null;
alter table public.leads add column if not exists profile_id     uuid references public.profiles(id) on delete set null;
  -- set when a lead converts, so partner attribution survives to revenue
alter table public.leads add column if not exists next_action    text;
alter table public.leads add column if not exists next_action_at timestamptz;
alter table public.leads add column if not exists lost_reason    text;

create index if not exists leads_status_idx      on public.leads (status);
create index if not exists leads_next_action_idx on public.leads (next_action_at) where next_action_at is not null;
create index if not exists leads_partner_idx     on public.leads (partner_id);

-- 3. Founder-private notes on a lead. Mirrors ticket_notes exactly: its own table
--    with RLS on and NO policies, so only the service-role admin client can touch it.
create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  text       text not null,
  created_at timestamptz not null default now()
);
alter table public.lead_notes enable row level security;  -- no policies = service role only

-- 4. Outreach log — one row per touch, so the Rule of 100 is measurable.
create table if not exists public.touches (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references public.leads(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete cascade,
  kind       text not null,                       -- call | email | dm | meeting | event
  note       text,
  created_at timestamptz not null default now()
);
alter table public.touches enable row level security;  -- no policies = service role only
create index if not exists touches_created_idx on public.touches (created_at desc);
```

Save as `supabase/migrations/<timestamp>_acquisition_pipeline.sql` in the app repo, then
run it in the Supabase SQL editor.

### The console work that goes with it

1. **`/founder/pipeline`** — leads grouped by `status`, with the partner and source on each
   row, and inline status changes. Reuse the `/founder/tickets` list + detail shape.
2. **`/founder/partners`** — the partner list with `next_action_at` sorted soonest-first.
3. **A "due today" strip on `/founder`** — every lead or partner whose `next_action_at` has
   passed. Without this the fields get filled in once and never looked at again.
4. **Source attribution on the revenue panel** — MRR split by `leads.source`, joined via
   `leads.profile_id`. This is what tells you whether partnerships or content is actually
   producing customers, which is the central open question of the whole growth model.

Until #4 exists, the channel decision is being made on instinct rather than data.

---

## 4. Operating rules

- **Every lead gets a `next_action_at` or a `lost_reason`.** No lead sits in `new`
  with no date — that is how a pipeline silently becomes a graveyard.
- **Log the touch, not the intention.** A row in `touches` means contact was actually made.
- **`status = won` requires `profile_id`.** Otherwise partner attribution breaks at exactly
  the moment it becomes valuable.
- **Never add a founder-private column to a customer-readable table.** Use a separate
  policy-less table, as `ticket_notes` does. A customer can query their own row's every
  column directly through Supabase.
- **Weekly export.** The CRM is a single Supabase project. Back it up — see
  [`OPERATIONS.md`](OPERATIONS.md) §4.
