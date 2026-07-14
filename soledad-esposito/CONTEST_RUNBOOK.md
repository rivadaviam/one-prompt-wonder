# Contest Runbook

Use this folder as the prepared harness for the HTML recreation round.

## Before the Prompt

1. Make sure dependencies are installed:

```bash
npm install
```

2. Open `ONE_PROMPT_HTML.md`.
3. Copy the full prompt block.
4. Replace the `REFERENCE` section with either:
   - `Use the attached image as the visual reference.`
   - the supplied HTML markup.
   - a written visual description.
5. Send that as the single prompt.

If you need to describe the page in Spanish, use `SPANISH_LIVE_PROMPT.md`
instead. It tells the agent to internally translate your description into an
English design brief while keeping the generated app in English.

## During Generation

The agent should:

- modify the frontend files
- add assets under `public/` if needed
- run `npm run build`
- fix any build errors
- leave the app ready for a local demo

Do not manually edit the generated product after the one prompt.

## Demo

Run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Push

From the repository root, stage only this participant folder:

```bash
git add soledad-esposito
git commit -m "Add Soledad HTML recreation"
git push origin main
```
