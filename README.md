# The CRISPR Index

Static HTML/CSS/JavaScript site with a Vercel Node.js function at `api/tutor.js`.

## Vercel structure

- `index.html` is the site entry point at the repository root.
- `styles.css` contains the site styles.
- `script.js` contains the research library and client-side logic.
- `assets/` contains images and the favicon.
- `api/tutor.js` is exposed by Vercel as `/api/tutor`.
- `favicon.ico` is the root favicon.

No framework or custom Vercel build configuration is required. Vercel auto-detects the root static site and the `/api` Node.js function.

## Deploy

Push the contents of this folder to the root of the GitHub repository. Do not put the project inside another folder in the repository.

In Vercel, set the project's Root Directory to `.` or leave it as the repository root. Use the default build settings.

For the AI Tutor, add `OPENAI_API_KEY` as a Vercel Environment Variable. Optionally set `OPENAI_MODEL`.


## 2026 research update
The paper library includes 10 additional 2026 CRISPR and genome-editing articles, with publication dates and checked source links.
