# Step 3 — SEO-optimized caption

Article step: **OpenAI → Create a Completion**, model `gpt-4o-mini`.

Reproduced from the article. `{{SOURCES}}` stands in for Make's `{{5.choices[].message.content}}`
— the script produced by step 2.

---

```
# EXAMPLE

<example>
Many people have recently asked me about ask engine optimization, which is all about optimizing your website and existing content, so it can be pulled into ChatGPT and other generative AI tools.
Consider that generative AI tools tend to be more conversational in nature and have a Q&A type format, so search engines will want to pull in snippets that concisely answer a user's question.
- what is ask engine optimization in the age of AI?
- How does traditional SEO compare to ask engine optimization today?
- top tips and tricks to get started with ask engine optimization?

#ai #askengineoptimization #chatgpts #seo #aitools #digitalmarketing
</example>

# CONTEXT

Infer the topic from the sources provided.

# WRITING STYLE

Here's how you always write:

<writing_style>
- Your writing style is spartan and informative.
- Use clear, simple language.
- Employ short, impactful sentences.
- Use active voice; avoid passive voice.
- Focus on practical, actionable insights.
- Incorporate data or statistics to support claims when possible.
- Use "you" and "your" to directly address the reader.
- Avoid metaphors and clichés.
- Avoid generalizations.
- Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
- Do not output warnings or notes—just the output requested.
- Do not use hashtags.
- Do not use semicolons.
- Do not use emojis.
- Do not use asterisks.
- Do not use adjectives and adverbs.
- Do NOT use these words: can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, you're not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, enrich, intricate, elucidate, hence, furthermore, realm, however, harness, exciting, groundbreaking, cutting-edge, remarkable, it. remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, bustling, opened up, powerful, inquiries, ever-evolving
</writing_style>

# PLANNING

Your goal is to write a 50-word video caption based on the provided source.

1. Analyze the provided sources thoroughly.
2. Study the <example> post carefully. You will be asked to replicate their:
    - Overall structure.
    - Tone and voice.
    - Formatting (including line breaks and spacing).
    - Length (aim for a similarly detailed post).
    - Absence of emojis.
    - Use of hashtags.
    - Emotional resonance.

# OUTPUT
Follow the GUIDELINES below to write the post. Use your analysis from step 1 and step 2. Use the provided sources as the foundation for your post, expanding on it significantly while maintaining the style and structure of the examples provided from step 2. You MUST use information from the provided sources. Make sure you adhere to your <writing_style>.

<guidelines>
The description should be structured as follows:
1. Start with 1 paragraph summarizing the source
2. Newline, followed by 3 bullet points of questions that a viewer might ask on a search engine about the source
3. Newline, followed by the 5 most popular hashtags related to the source
</guidelines>

Take a deep breath and take it step-by-step!

# INPUT
Use the following information sources:
<sources>
{{SOURCES}}
</sources>
```

---

## Note on the internal contradiction

The `<writing_style>` block says "Do not use hashtags" while `<guidelines>` requires 5 hashtags
and the `<example>` ends in hashtags. The guidelines win — the example output is the tiebreaker.
This is verbatim from the article, left as-is so the behavior matches the original.

## Where the output goes

Save the caption into `content/<run-id>.json` as the `caption` field. It is written alongside the
MP4 as `<run-id>.caption.txt` for you to paste when posting.
