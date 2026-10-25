# The CRISPR Index — Live AI Tutor setup

The website now has a real AI Tutor. The browser sends the selected paper, the student's question, and recent conversation turns to `/api/tutor`. The API route calls OpenAI's Responses API and returns the answer.

## Why this is not a single standalone HTML file

A live AI feature needs a secret API key. Never put that key in `index.html` or `script.js`, because anyone visiting the page could extract it. Keep `OPENAI_API_KEY` on the server as an environment variable.

## Easiest deployment: Vercel

1. Put this folder in a GitHub repository, or import the folder directly into Vercel.
2. Create an OpenAI API key in your OpenAI API account.
3. In Vercel, open **Project Settings → Environment Variables**.
4. Add `OPENAI_API_KEY` with your real key.
5. Optional: add `OPENAI_MODEL`. The included default is `gpt-5.6-terra`.
6. Deploy.
7. Open a research paper → **AI Tutor** → type any question → **Ask**.

Vercel automatically exposes `api/tutor.js` as `/api/tutor`.

## Important

- An OpenAI API key is billed through the OpenAI API account; it is separate from a ChatGPT Plus subscription.
- The key is not included in this project.
- The AI Tutor sends the current paper context with each question so paper-specific answers stay grounded in the information stored by The CRISPR Index.
- If a paper detail is not in the stored context, the tutor is instructed to say that rather than invent it.
