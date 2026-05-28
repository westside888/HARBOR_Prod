#!/usr/bin/env node
/**
 * Adds name + data-field attributes to intake form controls in index.html.
 * Run: node scripts/annotate-intake-fields.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { FIELD_KEY_TO_LABEL } from '../lib/field-keys.js';

const filePath = new URL('../index.html', import.meta.url).pathname;
let html = readFileSync(filePath, 'utf8');

const start = html.indexOf('<form class="intake-form" id="intake-form"');
const end = html.indexOf('</form>', start) + '</form>'.length;
if (start < 0) throw new Error('intake form not found');

let section = html.slice(start, end);
let count = 0;

function injectAttrs(tag, fieldKey) {
  if (tag.includes('data-field=')) return tag;
  return tag.replace(/<(input|select|textarea)\b/, `<$1 name="${fieldKey}" data-field="${fieldKey}" `);
}

// Label patterns → field key (order matters: longer labels first)
const patterns = Object.entries(FIELD_KEY_TO_LABEL)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([key, label]) => ({ key, label }));

for (const { key, label } of patterns) {
  const labelEsc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const labelRe = new RegExp(
    `<label[^>]*>(?:[^<]|<(?!\\/label>))*${labelEsc.split(' ').join('\\s+')}(?:[^<]|<(?!\\/label)>)*<\\/label>`,
    'gi'
  );

  section = section.replace(labelRe, (labelHtml) => {
    const after = section.slice(section.indexOf(labelHtml) + labelHtml.length, section.indexOf(labelHtml) + labelHtml.length + 800);
    // Process only the immediate control group after this label in a local replace
    return labelHtml;
  });
}

// Simpler: for each field key, find label text in section and inject into next control(s)
for (const { key, label } of patterns) {
  const search = label.replace(/&amp;/g, '&');
  let idx = 0;
  while ((idx = section.indexOf(label, idx)) !== -1) {
    // Find if we're inside a label tag
    const before = section.lastIndexOf('<label', idx);
    const afterLabel = section.indexOf('</label>', idx);
    if (before < 0 || afterLabel < 0) {
      idx++;
      continue;
    }
    let pos = afterLabel + 8;
    const slice = section.slice(pos, pos + 1200);

    if (slice.includes('intake-checkboxes')) {
      const cbEnd = section.indexOf('</div>', pos);
      const block = section.slice(pos, cbEnd);
      if (!block.includes(`data-field="${key}"`)) {
        const newBlock = block.replace(
          /<input type="checkbox"(?![^>]*data-field)/g,
          `<input type="checkbox" name="${key}" data-field="${key}" `
        );
        section = section.slice(0, pos) + newBlock + section.slice(cbEnd);
        count += (newBlock.match(/data-field/g) || []).length;
      }
      idx = cbEnd;
      continue;
    }

    const inputMatch = slice.match(/<(input|select|textarea)\b[^>]*>/);
    if (inputMatch && !inputMatch[0].includes('data-field')) {
      const newTag = injectAttrs(inputMatch[0], key);
      section = section.slice(0, pos) + section.slice(pos).replace(inputMatch[0], newTag, 1);
      count++;
    }
    idx = afterLabel + 1;
  }
}

html = html.slice(0, start) + section + html.slice(end);
writeFileSync(filePath, html);
console.log(`Annotated ${count} controls in index.html`);
