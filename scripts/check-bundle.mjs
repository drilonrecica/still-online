// Fails when the initial JS (the entry chunk and everything index.html preloads) is over budget.
// Run after `vite build`: `npm run build && npm run size`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 250;
const dist = new URL('../dist/', import.meta.url).pathname;
const html = readFileSync(join(dist, 'index.html'), 'utf8');

// Paths look like /still-online/assets/index-abc.js; keep the part from `assets/`.
const files = new Set(
  [
    ...html.matchAll(
      /<(?:script|link)\b[^>]*\b(?:src|href)="[^"]*?(assets\/[^"]+\.js)"/g,
    ),
  ].map((m) => m[1]),
);
if (files.size === 0) {
  console.error(
    'check-bundle: no JS found in dist/index.html (run the build first)',
  );
  process.exit(2);
}

let total = 0;
for (const f of files) {
  const gz = gzipSync(readFileSync(join(dist, f))).length;
  total += gz;
  console.log(`  ${f}  ${(gz / 1024).toFixed(1)} KB gzip`);
}
const kb = total / 1024;
console.log(`Initial JS: ${kb.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB)`);
if (kb > BUDGET_KB) {
  console.error('check-bundle: over budget');
  process.exit(1);
}
