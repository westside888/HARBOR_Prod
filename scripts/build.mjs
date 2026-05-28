import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of ['index.html', 'win-avtech.html']) {
  cpSync(join(root, file), join(out, file));
}

cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
cpSync(join(root, 'js'), join(out, 'js'), { recursive: true });
cpSync(join(root, 'lib', 'field-keys.js'), join(out, 'js', 'field-keys.js'), { force: true });

console.log('Static site built → dist/');
