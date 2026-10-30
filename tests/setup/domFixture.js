import fs from 'node:fs';
import path from 'node:path';

export function loadAppMarkup() {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = match ? match[1] : html;
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/gi, '');
}

export function submit(formId) {
  const form = document.getElementById(formId);
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
