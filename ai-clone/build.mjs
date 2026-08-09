#!/usr/bin/env node
// Generates index.html (the HyperFrames composition) from config.json + a run file
// in content/. Deterministic: same inputs always produce the same composition.
//
//   node build.mjs content/2026-07-30-filler-words.json

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(resolve(here, "config.json"), "utf8"));

const runPath = process.argv[2];
if (!runPath) {
  console.error("usage: node build.mjs <content/run.json>");
  process.exit(1);
}
const run = JSON.parse(readFileSync(resolve(process.cwd(), runPath), "utf8"));

const { width, height, fps, hookSeconds, outroSeconds } = config.video;
const { accent, background, text, handle } = config.brand;

// `hook` is inlined as authored so it can carry light markup (<em> for the accent
// colour). Everything else routes through esc().
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ---------------------------------------------------------------- timing ----

// ffprobe ships with ffmpeg and is a hard requirement of `hyperframes render`,
// so when a voiceover exists we take the real duration rather than estimating.
function probeDuration(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Math.round(parseFloat(out.trim()) * 1000) / 1000;
}

const words = run.script.trim().split(/\s+/);

let speechSeconds;
let timingSource;
const voiceover = run.voiceover ? resolve(here, run.voiceover) : null;
if (voiceover && existsSync(voiceover)) {
  speechSeconds = probeDuration(voiceover);
  timingSource = "voiceover audio";
} else {
  speechSeconds = words.length / config.script.wordsPerSecond;
  timingSource = `estimate at ${config.script.wordsPerSecond} words/sec`;
}

// -------------------------------------------------------------- captions ----

// Group the monologue into caption cards of at most `maxWords`, never letting a
// card straddle a sentence boundary. Each card's screen time is proportional to
// its word count, so the captions track the speech without a word-level transcript.
function chunk(sentence, maxWords) {
  const w = sentence.trim().split(/\s+/).filter(Boolean);
  const out = [];
  for (let i = 0; i < w.length; i += maxWords) out.push(w.slice(i, i + maxWords));
  return out;
}

const sentences = run.script
  .trim()
  .split(/(?<=[.!?])\s+/)
  .filter(Boolean);

const cards = sentences.flatMap((s) => chunk(s, 6)).map((w) => w.join(" "));
const totalWords = cards.reduce((n, c) => n + c.split(/\s+/).length, 0);

let cursor = hookSeconds;
const captions = cards.map((textLine) => {
  const share = textLine.split(/\s+/).length / totalWords;
  const duration = Math.round(speechSeconds * share * 1000) / 1000;
  const start = Math.round(cursor * 1000) / 1000;
  cursor += duration;
  return { text: textLine, start, duration };
});

const total = Math.round((hookSeconds + speechSeconds + outroSeconds) * 1000) / 1000;

// ----------------------------------------------------------------- layers ----

const rel = (p) => relative(here, resolve(here, p)).split("\\").join("/");

// The talking-head clip is the article's HeyGen output. When it is absent the
// composition still renders — a gradient stage stands in for the avatar so the
// rest of the pipeline stays testable.
const avatar = run.avatarVideo ? rel(run.avatarVideo) : null;

const backdrop = avatar
  ? `      <video
        class="clip stage"
        id="stage"
        data-start="0"
        data-duration="${total}"
        data-track-index="0"
        data-has-audio="false"
        src="${esc(avatar)}"
        muted
        playsinline
      ></video>`
  : `      <div class="clip stage stage-fallback" id="stage" data-start="0" data-duration="${total}" data-track-index="0">
        <div class="orb orb-a" data-layout-allow-overflow></div>
        <div class="orb orb-b" data-layout-allow-overflow></div>
      </div>`;

const audioLayer =
  voiceover && existsSync(voiceover)
    ? `      <audio
        class="clip"
        data-start="${hookSeconds}"
        data-duration="${speechSeconds}"
        data-track-index="5"
        data-volume="1"
        src="${esc(rel(run.voiceover))}"
      ></audio>`
    : "      <!-- no voiceover yet: see README, step 4 -->";

const captionMarkup = captions
  .map(
    (c, i) => `      <div
        class="clip caption"
        id="caption-${i}"
        data-start="${c.start}"
        data-duration="${c.duration}"
        data-track-index="3"
      >${esc(c.text)}</div>`,
  )
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${width}, height=${height}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        background: ${background};
      }
      body {
        font-family: "Inter", sans-serif;
        color: ${text};
        -webkit-font-smoothing: antialiased;
      }

      .stage {
        position: absolute;
        inset: 0;
        width: ${width}px;
        height: ${height}px;
        object-fit: cover;
      }
      .stage-fallback {
        background: radial-gradient(120% 80% at 50% 0%, #172554 0%, ${background} 62%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(70px);
        opacity: 0.5;
      }
      .orb-a { width: 460px; height: 460px; top: 120px; left: -110px; background: ${accent}; }
      .orb-b { width: 380px; height: 380px; bottom: 220px; right: -90px; background: #6366f1; }

      .scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          rgba(11, 17, 32, 0.72) 0%,
          rgba(11, 17, 32, 0) 26%,
          rgba(11, 17, 32, 0) 52%,
          rgba(11, 17, 32, 0.88) 88%
        );
      }

      .hook {
        position: absolute;
        top: 190px;
        left: 56px;
        right: 56px;
        font-size: 66px;
        font-weight: 800;
        line-height: 1.08;
        letter-spacing: -0.035em;
      }
      .hook em { font-style: normal; color: ${accent}; }

      .caption {
        position: absolute;
        left: 56px;
        right: 56px;
        bottom: 250px;
        font-size: 46px;
        font-weight: 700;
        line-height: 1.22;
        letter-spacing: -0.02em;
        text-align: center;
        text-shadow: 0 4px 26px rgba(0, 0, 0, 0.6);
      }

      .rail {
        position: absolute;
        left: 56px;
        right: 56px;
        bottom: 150px;
        height: 5px;
        border-radius: 999px;
        background: rgba(248, 250, 252, 0.16);
        overflow: hidden;
      }
      .rail span {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 999px;
        background: ${accent};
        transform-origin: left center;
      }

      .handle {
        position: absolute;
        bottom: 84px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 26px;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: rgba(248, 250, 252, 0.68);
      }

      .outro {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 22px;
        background: ${background};
        text-align: center;
        padding: 0 64px;
      }
      .outro h2 { font-size: 60px; font-weight: 800; letter-spacing: -0.03em; }
      .outro p { font-size: 30px; color: ${accent}; letter-spacing: 0.04em; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${total}"
      data-width="${width}"
      data-height="${height}"
    >
${backdrop}

      <div class="clip scrim" id="scrim" data-start="0" data-duration="${total}" data-track-index="1"></div>

      <div class="clip hook" id="hook" data-start="0" data-duration="${hookSeconds}" data-track-index="2">
        ${run.hook}
      </div>

${captionMarkup}

      <div class="clip rail" id="rail" data-start="${hookSeconds}" data-duration="${speechSeconds}" data-track-index="4">
        <span id="rail-fill"></span>
      </div>

      <div class="clip handle" id="handle" data-start="0" data-duration="${hookSeconds + speechSeconds}" data-track-index="7">
        ${esc(handle)}
      </div>

      <div class="clip outro" id="outro" data-start="${hookSeconds + speechSeconds}" data-duration="${outroSeconds}" data-track-index="6">
        <h2>${esc(run.outroTitle ?? "Follow for more")}</h2>
        <p>${esc(handle)}</p>
      </div>

${audioLayer}
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      tl.from("#hook", { opacity: 0, y: 34, duration: 0.55, ease: "power3.out" }, 0.12);
${captions
  .map(
    (c, i) =>
      `      tl.from("#caption-${i}", { opacity: 0, y: 18, duration: 0.24, ease: "power2.out" }, ${c.start});`,
  )
  .join("\n")}
      tl.fromTo(
        "#rail-fill",
        { scaleX: 0 },
        { scaleX: 1, duration: ${speechSeconds}, ease: "none" },
        ${hookSeconds}
      );
      tl.from("#outro h2", { opacity: 0, y: 26, duration: 0.5, ease: "power3.out" }, ${hookSeconds + speechSeconds});

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

writeFileSync(resolve(here, "index.html"), html);

console.log(`built index.html from ${runPath}`);
console.log(`  canvas      ${width}x${height} @ ${fps}fps`);
console.log(`  speech      ${speechSeconds.toFixed(2)}s (${timingSource})`);
console.log(`  captions    ${captions.length} cards from ${words.length} words`);
console.log(`  avatar      ${avatar ?? "none — gradient stage stand-in"}`);
console.log(`  total       ${total.toFixed(2)}s`);
