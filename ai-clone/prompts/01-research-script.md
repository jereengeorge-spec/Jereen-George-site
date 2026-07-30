# Step 2 — Research + script

Article step: **Perplexity → Create a Chat Completion**, model `llama-3.1-sonar-large-128k-online`, Role `User`.

In this local pipeline the same job is done by a research-capable model with live web access.
Replace `{{NICHE}}` with the `niche` value from `config.json`.

The prompt below is reproduced from the article, with only the niche templated out.

---

```
# PURPOSE

Your task is to research {{NICHE}}, and then create a monologue script to be spoken by an AI avatar on social media.

Take a deep breath, and take it step-by-step.

1. Use the internet to find current and relevant tips specifically for {{NICHE}}. Focus on practical, easy-to-implement advice that can help protect against common problems.

2. Create a 25-second monologue script for an AI avatar video, following these guidelines:
    - The script should be approximately 25 seconds when spoken aloud.
    - Use 6th grade reading level
    - Include practical examples or scenarios to illustrate the importance of each tip.

3. Update the script's first 2 sentences. Succinctly state what the video is about and use a negative hook like "don't miss this...", "if you're not doing this...", "this is a common mistake...".

Focus on creating scroll-stopping content that will resonate with your audience and help them understand the importance of the topic!

# OUTPUT FORMAT

ONLY output the exact video script. Do not output anything else. NEVER include intermediate thoughts, notes, or formatting.
```

---

## Why the output format matters

The article is blunt about this: any stray characters or intermediate notes get passed straight
into the avatar's Input Text, and **the avatar will literally try to speak them**. Verify the
output is clean before it moves on to the video step.

## Where the output goes

Save the script into `content/<run-id>.json` as the `script` field. `build.mjs` reads it from there.
