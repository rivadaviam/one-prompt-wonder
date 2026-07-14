# TRUUS — Motion Agency Experience

A local, responsive recreation of the bold editorial experience at `truus.co`. It uses oversized typography, vivid color fields, campaign imagery, scroll-driven parallax, reveal choreography, marquees, a draggable/scrollable work rail, an animated team counter, magnetic links, a custom cursor, a full-screen menu, and service accordions.

## Prerequisites

- Node.js 20.19+ (Node 22 recommended)
- npm 10+

## Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## Validate

```bash
npm test
npm run build
```

## Demo

1. Load the homepage and watch the numeric intro transition into the animated type hero.
2. Scroll through the yellow statement and pinned blue manifesto.
3. Drag the project gallery horizontally, hover a card, and open a project link.
4. Scroll through the parallax team portrait and watch the team counter advance.
5. Expand/collapse service rows, open/close the full-screen menu, and use the email CTA.
6. Resize below 800px to see the touch-friendly mobile layout.

## Assumptions

- This is an experience-focused single-page recreation, not a copy of the original Webflow CMS or every project detail page.
- The public brand copy and four campaign thumbnails are used for visual fidelity; the main group portrait was generated specifically for this local demo.
- External project/social links intentionally open their real destinations; the core site and all visual assets work locally without API keys.

## Limitations

- Google Fonts are enhanced when online; standard sans-serif fallbacks keep the layout functional offline.
- Contact actions use the local email/WhatsApp handlers rather than a backend form.
