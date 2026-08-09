# AI clone video pipeline

A local implementation of the workflow in Sabrina Ramonov's *Your 100% Automated AI Clone Makes
Talking Videos*, rebuilt around tools that run on this machine instead of paid SaaS.

The original chains **Make.com → Perplexity → ChatGPT → HeyGen → Blotato → Google Sheets** and
auto-posts daily. This version keeps the same five steps and the same prompts, swaps the
orchestrator and renderer for local tooling, and **stops before publishing** — it hands you a
finished MP4 and a caption file to post yourself.

## Step mapping

| # | Article step | Article tool | Here | Status |
|---|---|---|---|---|
| 1 | Orchestrate the run | Make.com scenario, daily schedule | `run.mjs` | Working |
| 2 | Research + 25s script | Perplexity `llama-3.1-sonar-large-128k-online` | `prompts/01-research-script.md` run by a web-capable model | Working |
| 3 | SEO caption | OpenAI `gpt-4o-mini` | `prompts/02-seo-caption.md` | Working |
| 4 | Talking-head video | HeyGen avatar + voice | HyperFrames composition; avatar clip is a drop-in slot | **Partial — see below** |
| 5 | Publish everywhere | Blotato → 8 platforms | Nothing. You post manually. | By choice |
| 6 | Track published posts | Google Sheets | `content/*.json` in git | Working |

## What step 4 actually does today

This is the one honest gap. The article's centerpiece is a photoreal avatar of *you* speaking the
script, which needs a service that clones a face and a voice. Nothing on this machine does that:

- **Higgsfield** (connected over MCP) has the models for it, but the account is on the `free` plan
  with **0 credits**, so every generation call fails.
- **HeyGen / ElevenLabs** would work but need paid API keys.
- **Kokoro TTS** (`pip install kokoro-onnx soundfile`) gives a synthetic voice, not your voice.

So the composition renders a **captioned vertical video with a gradient stage** where the avatar
belongs. It is a complete, postable video — it just is not a talking head yet.

Both missing pieces are drop-in slots in the run file, and the builder wires them automatically:

```json
{
  "avatarVideo": "assets/avatar-2026-07-30.mp4",
  "voiceover":   "assets/voice-2026-07-30.mp3"
}
```

Add `avatarVideo` and it becomes the full-frame backdrop instead of the gradient. Add `voiceover`
and `build.mjs` probes its real duration with `ffprobe` and retimes every caption to match, instead
of estimating from word count. Neither needs a code change.

## Usage

```bash
cd ai-clone

# steps 4-5: build → check → render → write caption
node run.mjs content/2026-07-30-filler-words.json

# just rebuild the composition
node build.mjs content/2026-07-30-filler-words.json

# preview in a browser (long-running server)
npm run dev
```

Output lands in `out/`:

```
out/2026-07-30-filler-words.mp4          720x1280, H.264, 30fps
out/2026-07-30-filler-words.caption.txt  paste into the post
```

## Making a new video

1. Run the prompt in `prompts/01-research-script.md` with the niche from `config.json`. Take the
   script exactly as returned — the article warns that stray notes get spoken aloud by the avatar.
2. Run `prompts/02-seo-caption.md` against that script.
3. Save both into `content/<date>-<slug>.json` (copy the existing file for the shape).
4. `node run.mjs content/<date>-<slug>.json`.
5. Post the MP4 with the caption.

## Settings carried over from the article

`config.json` holds the values the article specifies for the HeyGen module, so they survive if you
later swap the renderer for HeyGen's API:

- **720 × 1280** — the article's short-form dimensions (its note about a 720p cap applies to
  HeyGen's free plan, not to local rendering)
- **Voice speed 1** (valid range 0.5–1.5), **pitch 50** (−50 to 50), **emotion Excited**
- **~25 second** target script at a 6th grade reading level

`script.wordsPerSecond` (2.6) only estimates caption timing when no voiceover exists. A real
voiceover overrides it.

## How the composition is built

`build.mjs` generates `index.html` deterministically from `config.json` plus a run file — same
inputs, same video, every time. It splits the monologue into caption cards of at most six words,
never letting a card cross a sentence boundary, and gives each card screen time proportional to its
word count. Layers: avatar or gradient stage → scrim → hook card → captions → progress rail →
handle → outro.

Run `npm run check` after editing anything. It catches occluded text, clip collisions on a track,
and WCAG contrast failures — the class of bug that yields a video that renders fine and is
unreadable on a phone.

## Local requirements

Handled at the repo root (`npm install`), plus two machine-level installs that are not in git:

```bash
sudo apt-get install -y ffmpeg   # encoding + ffprobe
npx hyperframes browser ensure   # Chrome Headless Shell
npx hyperframes doctor           # verify
```

GSAP is vendored at `assets/vendor/gsap.min.js` rather than loaded from a CDN, so rendering works
without external network access.
