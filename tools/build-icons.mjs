// Regenerates favicon.svg plus the PNG / ICO icons from the logo geometry.
// Usage: node tools/build-icons.mjs   (needs Playwright's Chromium for the PNGs)
import { writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { faviconSVG, markSVG } from '../src/ui/logo.js';

const out = (p) => new URL(`../assets/icons/${p}`, import.meta.url);

const svg = faviconSVG();
writeFileSync(out('favicon.svg'), svg);
writeFileSync(out('logo-mark.svg'), markSVG({ size: 256, fill: '#6AD3CB' }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

let chromium;
try {
  ({ chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright'));
} catch {
  console.log('Playwright not found: wrote favicon.svg only.');
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const sizes = { 'apple-touch-icon.png': [180, faviconSVG({ radius: 0 })], 'icon-192.png': [192, svg], 'icon-512.png': [512, svg], 'favicon-32.png': [32, svg], 'favicon-16.png': [16, svg], 'og-mark.png': [1024, svg] };
for (const [name, [px, s]] of Object.entries(sizes)) {
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(`<html><body style="margin:0;background:transparent">${s.replace('<svg ', `<svg width="${px}" height="${px}" `)}</body></html>`);
  await page.screenshot({ path: out(name).pathname, omitBackground: true, clip: { x: 0, y: 0, width: px, height: px } });
}
await browser.close();

try {
  execSync(`convert ${out('favicon-16.png').pathname} ${out('favicon-32.png').pathname} ${out('favicon.ico').pathname}`);
} catch {
  console.log('ImageMagick not found: skipped favicon.ico');
}
console.log('Icons written to assets/icons/');
