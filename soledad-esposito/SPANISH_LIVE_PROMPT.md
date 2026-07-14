# Spanish Live Prompt

Use this version if you need to describe the reference in Spanish during the
contest. The generated app should still be implemented with English code naming
and English visible UI text unless the reference explicitly uses another
language.

```text
You are in a One Prompt Wonder challenge. This is the only prompt. There will be no follow-up corrections.

Do not ask questions. If anything is unclear, make the most practical assumption and continue.

I may describe the reference in Spanish. First, internally convert my Spanish description into a concise English design brief. Do not stop to show me the translation. Use that English brief to build the product.

Using the existing Vite + JavaScript + CSS harness, build a frontend-only recreation of the provided reference or visual description.

If I attach an image, recreate the visible page as closely as possible. If I paste HTML, recreate the rendered page as a polished local implementation. If I provide only a Spanish description, recreate the page from that description. If more than one reference is provided, use the image as the visual source of truth, the HTML for structure/content, and the Spanish description for clarifications.

The final app should be in English: visible UI copy, labels, buttons, component names, file names, CSS class names, and comments should be English, unless the reference itself clearly requires Spanish text.

Prioritize visual fidelity and demo quality:
- layout, spacing, alignment, sizing, and responsive behavior
- typography, font weights, line heights, and hierarchy
- colors, borders, backgrounds, shadows, and surfaces
- imagery, icons, illustrations, logos, and decorative details
- accurate visible copy, labels, numbers, and UI states
- hover/focus states and lightweight interactions when implied

Keep it simple, complete, and demo-ready. Do not add backend, auth, extra pages, explanations, onboarding, or placeholder content unless the reference includes them.

Use semantic HTML, clean CSS, and minimal JavaScript only if needed. Put assets in public/. Run npm run build and fix errors. Leave local run instructions.

SPANISH VISUAL SPEC / REFERENCE:
[Describe the page here in Spanish, or attach an image, or paste HTML.]
```

## Spanish Description Shape

If you are writing the visual spec live, describe it in this order:

```text
Tipo de pantalla:
[dashboard / landing / login / pricing / ecommerce / article / app screen]

Layout:
[header, sidebar, columns, cards, sections, grid, spacing]

Contenido visible:
[exact text, numbers, button labels, menu items]

Estilo:
[colors, typography, shadows, borders, radius, density]

Interacciones:
[tabs, hover, dropdown, forms, buttons]

Responsive:
[how it should behave on mobile]
```
