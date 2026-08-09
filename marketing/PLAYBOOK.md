# Brand & Marketing Operating System

The framework: Sabrina Ramonov's 30-day personal-brand system (*How I'd Start a 1-Person
Business + Personal Brand with AI in 30 Days*), fused with the assets already in these repos —
the TechButler SaaS, the 30-video Shorts scriptbook, and the local HyperFrames video pipeline.

> **Read [`GROWTH_MODEL.md`](GROWTH_MODEL.md) first.** This playbook covers *how to make the
> content*. That one covers *which channel reaches income replacement*, using Hormozi's Core
> Four and money-model math. Short version: content is the durable asset but it is not the
> fastest path — warm outreach and professional partnerships are, because the whole target is
> roughly 150 customers, not a large audience.

## The system, distilled

**Core law: 30 days builds the machine. The money comes after. Selling too early kills it.**
Value first, then offers. Ads cost money; content builds trust for free. 60 minutes a day.

### Phase 1 — Pick your topic (days 1–3)
- A personal brand = being known for **1 thing** by people who've never met you.
- Topic = the overlap of three circles: something you enjoy, something you're good at,
  something people already spend money on.
- Compress it to one sentence: **"I teach [WHO] how to [WHAT]."** That sentence becomes your bio.
- No switching topics for 30 days. The #1 failure mode is switching too early, not picking wrong.
- AI is a hot topic right now — if it touches your niche, lean into it.

### Phase 2 — Pick ONE platform + collect winners (days 4–7)
- Comfortable on camera → TikTok (new accounts get views fastest). Not comfortable → LinkedIn
  or Substack, write instead of film.
- Find top creators in the niche, sort by most popular posts, save the best hooks in a
  **swipe file**. Study contrast, curiosity, specificity, stakes, speed.
- **The remix rule:** copy two things EXACTLY — the on-screen title and the opener (first 5
  seconds of video / first 2 sentences of text). Remix everything after with your own take.
  Millions of viewers already voted on those openers.
- Update the posting account so it doesn't look like a bot: username close to name/topic,
  photo (face, or topic if faceless), bio = the step-1 sentence.

### Phase 3 — Post once per day (days 8–25)
- First 17 posts remix proven viral winners. Film in one take on a phone; don't over-edit.
- Filming loop: read script aloud and change any word you'd never say → TikTok native app →
  teleprompter effect → one take → on-screen title (word-for-word the proven opener) →
  subtitles that don't block the face → caption + 3 broad hashtags → post.
- **Reply to every comment within 2 hours.** After 2 hours: post still growing → keep
  commenting; flat → stop.
- Almost nobody sees the first posts. That's a gift — free practice while nobody's looking.
- Optimize for output, not perfection: **25 videos in 32 days beats 11 in 100.**

### Phase 4 — Find your own voice (days 25–30)
- Formula: **do stuff, then share it.** 45 min/day: try one small thing in the topic → notice
  what happened → share the lesson. Content from action, not theory — you never run out.

### Phase 5 — First dollar (day 30+)
- Keep helping free until you can't. People buy from creators they already trust.
- DM your 5 most engaged followers, ask what they're stuck on. If the same problem repeats,
  package the shortcut: template, audit, guide, workshop, or done-with-you session.
- **You're not selling expertise. You're selling a HEAD START.**

### The 4 AI prompts (adapted, ready to run)
1. **Find your topic:** "Here are my skills: […]. Here's what I enjoy: […]. 3 things people have
   paid or thanked me for: […]. Suggest 3 topics I could post about where people already spend
   money. For each topic, name 3 big creators." (Verify creators exist — AI invents names.)
2. **Personalize remixes:** "Ask me 3 questions to personalize these drafts to my perspective."
   Answer once; every draft after carries your stories and opinions.
3. **Weekly idea list:** "My topic is [topic]. List 15 small things a beginner could try, test,
   or build in under 30 minutes, where the result would surprise people. I'll do 1 per day and
   share what I learned."
4. **Daily script:** "Write a 30-second video script, 70 words max. Start with a
   scroll-stopping hook. What I did today: [2 sentences]. What surprised me: [1 sentence].
   Casual, like I'm texting a friend. Also give me a 1-line caption plus 3 broad hashtags."

## How this maps onto what already exists

| System requirement | Already built | Gap |
|---|---|---|
| Topic + one-sentence positioning | TechButler: "Stop being your family's tech support" — the WHO (sandwich-generation adult child) and WHAT are sharp | Decide which brand runs first (TechButler vs. personal/speaking brand) |
| Swipe file of proven hooks | `techbutler.app/docs/CONTENT_CALENDAR.md` — 30 hooks grounded in verbatim Reddit titles that already got upvotes (the same "millions voted" logic) | None — this IS a swipe file |
| Daily video production | `ai-clone/` HyperFrames pipeline renders captioned 9:16 MP4s locally, free, validated | Retarget to 1080×1920 + safe zones; voiceover source; mascot stills |
| 17 remix scripts ready | `techbutler.app/docs/SHORTS_SCRIPTBOOK.md` S1–S30 with VO, frames, captions, motion, CTAs | Mascot has 3 names (George/Butler/Alfred) — must be ONE before generating the locked reference image |
| Free-value funnel (no selling) | `/stuck` free help page — anyone can ask, no account | Site must be deployed |
| The paid offer (day 30+) | TechButler $99/mo or $999/yr, 7-day trial, Stripe flow built | Live keys + deploy (see checklist) |
| Tracking | Log per post: views, avg % viewed, shares, link clicks, trials | Simple sheet or `content/*.json` log |

**One conflict, resolved:** the scriptbook rotates [Help]/[Trial]/[Follow] CTAs from day one;
the system says don't sell for 30 days. Resolution: weeks 1–3 use only [Help] (free link — pure
value) and [Follow] (identity) CTAs. Introduce [Trial] from week 4 once there's trust signal.

**Copy fix required before any [Trial] CTA runs:** the scriptbook says "first week's basically
free," but the confirmed billing charges a **$25 deposit today** before the 7-day trial.
Rewrite the CTA line honestly (e.g. "$25 today, cancel any time in the first week") — the gap
between ad copy and first card charge is how you get chargebacks and platform complaints.

## The daily 60-minute loop (once running)

1. (25 min) Pick the next scriptbook entry → run it through the `ai-clone` pipeline → render.
2. (10 min) Post to the primary platform; cross-post the same file to the other 3 later.
3. (20 min) Reply to every comment on the last 2 hours of posts.
4. (5 min) Log the numbers. Obsess over videos posted, not views.

## What I need from you (nothing below can be created for you)

### To make the SaaS buyable (deploy TechButler live)
- [ ] **Supabase** project created → URL, anon key, service-role key; run `supabase/schema.sql`
- [ ] **Stripe** (live mode): product with $99/mo + $999/yr prices, $25-off "once" coupon,
      webhook to `https://<domain>/api/stripe/webhook` → secret key, publishable key,
      webhook signing secret, price IDs, coupon ID
- [ ] **Anthropic API key** (powers the George assistant)
- [ ] **Vercel** account + the `techbutler.app` domain pointed at it
- [ ] `FOUNDER_EMAILS` — your email for the founder dashboard
- [ ] **Push access** to the techbutler.app repo if you want me making code changes there
      (my current clone is read-only; say the word and I'll request it via add_repo)

### Decisions only you can make
- [ ] **Brand name** — NAMING.md rates "TechButler" high-risk (registered trademark, direct
      competitors). You accepted the risk in brand.ts; confirm before we build a channel on it.
- [x] **Mascot name** — **George.** Same name as the in-product AI companion, so the mascot
      *is* the product. Rename "Alfred"/"the Butler" throughout the scriptbook before the
      locked reference image is generated.
- [x] **Face or faceless** — **Faceless.** Scriptbook path is primary; the talking-head /
      HeyGen path is dropped. You appear as a name and a voice (bio, captions, comment
      replies), never a face.
- [x] **Which brand leads** — **George / TechButler, not a personal brand.** Faceless plus a
      named mascot already decides this; see [`GROWTH_MODEL.md`](GROWTH_MODEL.md) §4 for why
      it's also the better call (transferable asset, no bridge from audience to product).

### Tools (status as of 2026-07-31)
- **Working now, $0:** HyperFrames render pipeline (`ai-clone/`), this repo's content log.
- **HeyGen MCP connector:** needs authorization in your claude.ai connector settings before I
  can use it (would give avatar + voice for talking-head videos).
- **Higgsfield:** connected but free plan, 0 credits — blocks mascot image generation and AI
  voiceover through it. ~$49/mo Plus would unblock both.
- **Blotato** ($29/mo): her tool for remix drafting + multi-platform auto-posting. Optional —
  you chose manual posting; the local pipeline + 4 prompts above cover the drafting.
