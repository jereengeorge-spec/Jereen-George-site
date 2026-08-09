#!/usr/bin/env node
// Steps 4-5 of the pipeline, chained: build the composition, validate it, render
// the MP4, and drop the caption next to it ready to paste.
//
// This is the part Make.com owned in the original workflow. Steps 2-3 (research,
// script, caption) run upstream and land in content/<run-id>.json.
//
//   node run.mjs content/2026-07-30-filler-words.json
//   node run.mjs content/2026-07-30-filler-words.json --skip-check

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const runPath = args.find((a) => !a.startsWith("--"));
const skipCheck = args.includes("--skip-check");

if (!runPath) {
  console.error("usage: node run.mjs <content/run.json> [--skip-check]");
  process.exit(1);
}

const run = JSON.parse(readFileSync(resolve(process.cwd(), runPath), "utf8"));
const id = run.id ?? basename(runPath, ".json");
const outDir = resolve(here, "out");
mkdirSync(outDir, { recursive: true });

const step = (label, cmd, cmdArgs) => {
  console.log(`\n── ${label}`);
  const res = spawnSync(cmd, cmdArgs, { cwd: here, stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
};

step("build composition", process.execPath, ["build.mjs", runPath]);

if (!skipCheck) {
  // lint + runtime + layout + motion + contrast. Catches the class of mistake
  // that silently produces an unreadable video.
  step("check composition", "npx", ["hyperframes", "check"]);
}

const mp4 = resolve(outDir, `${id}.mp4`);
step("render mp4", "npx", ["hyperframes", "render", "--output", mp4]);

// The caption is the other half of a post. Writing it beside the MP4 means
// posting is copy, paste, upload.
const captionFile = resolve(outDir, `${id}.caption.txt`);
writeFileSync(captionFile, `${run.caption.trim()}\n`);

console.log(`\n✓ ready to post`);
console.log(`  video    ai-clone/out/${id}.mp4`);
console.log(`  caption  ai-clone/out/${id}.caption.txt`);
