# One Prompt Wonder HTML Prompt

Use this as the single prompt for the HTML recreation round. Copy the full
prompt block and replace only the reference section at the bottom.

```text
You are participating in a One Prompt Wonder programming challenge. You have exactly one prompt and there will be no follow-up corrections.

Do not ask any follow-up questions. If anything is ambiguous, make the most practical assumption and continue.

Your task is to build a frontend-only local recreation of the provided reference using the existing project harness. The harness already uses Vite, JavaScript, and plain CSS. Work inside the current project. You may create, delete, or modify files as needed, install dependencies only if truly useful, and run commands.

Time matters. Prefer a complete, polished, demo-ready recreation over an overengineered implementation. Avoid heavy frameworks, backend services, databases, authentication, test suites, or build tooling changes unless the reference clearly requires them.

The reference may be either:
1. an attached screenshot/image, or
2. HTML markup included in this prompt.
3. a written visual description, possibly in Spanish, if no image or HTML can be provided.

If a screenshot or image is provided, recreate the visible page as closely as possible.
If HTML markup is provided, recreate the rendered page as a polished local implementation.
If a written Spanish description is provided, internally convert it into a concise English design brief and build from that. Do not stop to show the translation.
If both are provided, use the screenshot/image as the visual source of truth and the HTML as content/structure guidance.

The final app should use English for visible UI copy, labels, buttons, component names, file names, CSS class names, and comments unless the reference itself clearly uses another language.

Prioritize visual fidelity and demo quality:
- layout, spacing, alignment, sizing, and responsive behavior
- typography, font weights, line heights, and hierarchy
- colors, borders, backgrounds, shadows, and surfaces
- imagery, icons, illustrations, logos, and decorative details
- hover/focus states and lightweight interactions when implied by the reference
- accurate visible copy, labels, numbers, and UI states

Use semantic HTML, clean CSS, and lightweight JavaScript only where interaction is needed. Do not create a landing page, explanation page, or extra onboarding unless the reference itself contains one. Do not leave placeholder content unless the reference itself contains placeholder content. Avoid overengineering.

Make the result work well on desktop and mobile. Use stable responsive dimensions so text and controls do not overlap or overflow. Prefer CSS Grid/Flexbox, CSS variables, and modern browser features supported by Vite. Use media queries where needed.

Visual reconstruction guidance:
- Start by identifying the main page regions, then implement from largest layout blocks to smaller details.
- Preserve the reference's density: do not make compact UIs into spacious marketing pages.
- Match the reference's tone: dashboard, product page, article, app screen, form, or landing page.
- If exact fonts are unavailable, use the closest system font stack and tune weight, size, and spacing.
- If exact images are unavailable, use CSS shapes, gradients, cropped color blocks, or simple local stand-ins that preserve the composition.
- If icons are needed, use inline SVG or simple CSS/HTML shapes rather than installing a large icon library.

Implementation requirements:
- Use the existing Vite entry point unless there is a good reason to change it.
- Keep the app frontend-only.
- Put static assets in public/ when needed.
- If external images are unavailable, recreate the visual intent with CSS or simple local placeholders that preserve the layout and style.
- Ensure npm run build succeeds.
- Leave the app ready to run locally for a live screen-share demo.

After implementing, run:
1. npm install if dependencies are missing
2. npm run build

Fix any errors you find. If browser preview or screenshot tools are available, open the local app and quickly check the desktop and mobile layouts for obvious visual issues, overflow, or blank rendering. When finished, briefly summarize what you built and how to run it locally.

REFERENCE:
[If the input is an image, write: Use the attached image as the visual reference.]
[If the input is HTML, paste the HTML markup here.]
```
