import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../dist/', import.meta.url);
const rootPath = fileURLToPath(root);
const basePath = (process.env.BASE_PATH ?? '/').replace(/^\/+|\/+$/g, '');
const failures = [];
let checkedLinks = 0;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function resolveOutput(pathname) {
  const withoutBase = basePath && pathname.startsWith(`/${basePath}/`)
    ? pathname.slice(basePath.length + 2)
    : pathname.replace(/^\//, '');
  const target = new URL(withoutBase, root);
  const filePath = fileURLToPath(target);
  if (extname(filePath)) return filePath;
  return join(filePath, 'index.html');
}

const htmlFiles = walk(rootPath).filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const attributes = html.matchAll(/(?:href|src)="([^"]+)"/g);
  for (const [, value] of attributes) {
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const pathname = value.split(/[?#]/, 1)[0];
    const target = resolveOutput(pathname);
    checkedLinks += 1;
    if (!existsSync(target)) {
      failures.push(`${relative(rootPath, file)} -> ${value}`);
    }
  }
}

const rootHtml = readFileSync(new URL('index.html', root), 'utf8');
if (!rootHtml.includes(`${basePath ? `/${basePath}` : ''}/zh/`)) {
  failures.push('index.html does not redirect to the Chinese route');
}

if (failures.length) {
  console.error('Build verification failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Verified ${htmlFiles.length} HTML pages and ${checkedLinks} internal links/assets.`);
