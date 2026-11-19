import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Accessibility & WCAG 2.1 AA Compliance Tests', () => {
  const indexHtmlPath = path.resolve(__dirname, '../../client/index.html');
  const appJsxPath = path.resolve(__dirname, '../../client/src/App.jsx');
  const headerJsxPath = path.resolve(__dirname, '../../client/src/components/AQIHeader.jsx');

  it('verifies index.html has html lang attribute and responsive viewport', () => {
    const html = readFileSync(indexHtmlPath, 'utf8');
    assert.ok(html.includes('<html lang="en">'), 'Must declare html lang attribute');
    assert.ok(html.includes('name="viewport"'), 'Must define responsive viewport');
    assert.ok(html.includes('<title>'), 'Must contain descriptive page title');
  });

  it('verifies App.jsx contains semantic landmarks and skip links', () => {
    const jsx = readFileSync(appJsxPath, 'utf8');
    assert.ok(jsx.includes('role="main"'), 'Must declare main landmark');
    assert.ok(jsx.includes('Skip to main content'), 'Must provide keyboard skip link');
    assert.ok(jsx.includes('role="contentinfo"'), 'Must declare footer landmark');
    assert.ok(jsx.includes('aria-live="polite"'), 'Must declare aria-live region for dynamic AQI updates');
  });

  it('verifies AQIHeader supports screen readers with region role and aria-label', () => {
    const jsx = readFileSync(headerJsxPath, 'utf8');
    assert.ok(jsx.includes('role="region"'), 'Must have region role');
    assert.ok(jsx.includes('aria-label="Air Quality Summary"'), 'Must have descriptive aria-label');
    assert.ok(jsx.includes('title='), 'Must have descriptive title tooltips on icon buttons');
  });
});
