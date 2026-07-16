import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const artifactDir = path.join(process.cwd(), "verificacion");
const comparisons = [
  { name: "desktop", maxMismatchPercent: 1 },
  { name: "mobile", maxMismatchPercent: 1 },
];
const results = {};

for (const comparison of comparisons) {
  const original = PNG.sync.read(await readFile(path.join(artifactDir, `original-${comparison.name}.png`)));
  const replica = PNG.sync.read(await readFile(path.join(artifactDir, `replica-${comparison.name}.png`)));
  assert.equal(replica.width, original.width, `${comparison.name} screenshot width differs`);
  assert.equal(replica.height, original.height, `${comparison.name} screenshot height differs`);

  const diff = new PNG({ width: original.width, height: original.height });
  const mismatchedPixels = pixelmatch(
    original.data,
    replica.data,
    diff.data,
    original.width,
    original.height,
    { threshold: 0.1, includeAA: false },
  );
  const mismatchPercent = (mismatchedPixels / (original.width * original.height)) * 100;
  await writeFile(path.join(artifactDir, `diff-${comparison.name}.png`), PNG.sync.write(diff));
  results[comparison.name] = { mismatchedPixels, mismatchPercent };
  assert(
    mismatchPercent <= comparison.maxMismatchPercent,
    `${comparison.name} visual mismatch ${mismatchPercent.toFixed(3)}% exceeds ${comparison.maxMismatchPercent}%`,
  );
}

const resultPath = path.join(artifactDir, "resultados.json");
const qaResults = JSON.parse(await readFile(resultPath, "utf8"));
await writeFile(resultPath, `${JSON.stringify({ ...qaResults, visual: results }, null, 2)}\n`);

console.log(
  `Comparación visual aprobada — desktop ${results.desktop.mismatchPercent.toFixed(3)}%, mobile ${results.mobile.mismatchPercent.toFixed(3)}%.`,
);
