import { webkit } from 'playwright';

const browser = await webkit.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const problems = [];

page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') problems.push(`console: ${message.text()}`);
});
page.on('requestfailed', (request) => problems.push(`requestfailed: ${request.url()} :: ${request.failure()?.errorText ?? 'unknown'}`));

const response = await page.goto('http://127.0.0.1:4173/PolyYaps/', { waitUntil: 'networkidle' });
await page.waitForTimeout(750);

const bodyText = await page.locator('body').innerText();
const rootHtml = await page.locator('#root').innerHTML();

console.log(`status=${response?.status()}`);
console.log(`body=${bodyText.slice(0, 800)}`);
console.log(`rootLength=${rootHtml.length}`);
console.log(`problems=${JSON.stringify(problems)}`);

if (!response?.ok()) throw new Error(`Initial page returned ${response?.status()}`);
if (rootHtml.trim().length < 100) throw new Error('React root stayed effectively empty.');
if (!bodyText.includes('PolyYaps') || !bodyText.includes('Dag 1')) throw new Error('Expected PolyYaps home content was not rendered.');
if (problems.length) throw new Error(`Browser runtime problems: ${problems.join(' | ')}`);

await browser.close();
