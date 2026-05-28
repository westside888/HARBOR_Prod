import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(root, 'index.html'), join(out, 'index.html'));
cpSync(join(root, 'win-avtech.html'), join(out, 'win-avtech.html'));

const winStoriesDir = join(out, 'win-stories');
mkdirSync(winStoriesDir, { recursive: true });
cpSync(join(root, 'win-avtech.html'), join(winStoriesDir, 'win-avtech.html'));

cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
cpSync(join(root, 'js'), join(out, 'js'), { recursive: true });
cpSync(join(root, 'lib', 'field-keys.js'), join(out, 'js', 'field-keys.js'), { force: true });

console.log('Static site built → dist/');
