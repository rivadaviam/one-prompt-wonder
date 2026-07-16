import { readFileSync, existsSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const html = readFileSync('index.html', 'utf8');
const js = readFileSync('src/main.js', 'utf8');
const css = readFileSync('src/style.css', 'utf8');

assert.match(html, /id="app"/);
assert.match(js, /IntersectionObserver/);
assert.match(js, /setMenu/);
assert.match(js, /work-rail/);
assert.match(js, /service-list/);
assert.match(css, /prefers-reduced-motion/);
for (const asset of ['team-hero.png', 'work-kfc.webp', 'work-hema.webp', 'work-travel.webp', 'work-coffee.webp']) {
  assert.ok(existsSync(`public/assets/${asset}`), `missing ${asset}`);
}
console.log('Smoke checks passed: shell, interactions, motion accessibility, and local assets are present.');
