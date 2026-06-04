import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { injectGoogleAnalytics } from './inject-google-analytics.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const gaId = process.env.GA_MEASUREMENT_ID || '';

function copyHtmlWithOptionalGa(srcName) {
  const srcPath = join(root, srcName);
  let html = readFileSync(srcPath, 'utf8');
  if (gaId) html = injectGoogleAnalytics(html, gaId);
  writeFileSync(join(out, srcName), html);
}

copyHtmlWithOptionalGa('index.html');
copyHtmlWithOptionalGa('win-avtech.html');

const winStoriesDir = join(out, 'win-stories');
mkdirSync(winStoriesDir, { recursive: true });
let avtechStories = readFileSync(join(root, 'win-avtech.html'), 'utf8');
if (gaId) avtechStories = injectGoogleAnalytics(avtechStories, gaId);
writeFileSync(join(winStoriesDir, 'win-avtech.html'), avtechStories);

cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

const wpContent = join(root, 'wp-content');
if (existsSync(wpContent)) {
  cpSync(wpContent, join(out, 'wp-content'), { recursive: true });
}
cpSync(join(root, 'js'), join(out, 'js'), { recursive: true });
cpSync(join(root, 'lib', 'field-keys.js'), join(out, 'js', 'field-keys.js'), { force: true });

console.log('Static site built → dist/');
if (gaId) console.log(`Google Analytics 4: ${gaId}`);
else console.log('Google Analytics: skipped (set GA_MEASUREMENT_ID to enable)');
