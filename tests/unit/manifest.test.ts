import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('manifest declares one Meet content script and no permissions', () => {
  const m = JSON.parse(readFileSync('manifest.json', 'utf8'));
  expect(m.manifest_version).toBe(3);
  expect(m.content_scripts).toHaveLength(1);
  expect(m.content_scripts[0].matches).toEqual(['https://meet.google.com/*']);
  expect(m.content_scripts[0].js).toEqual(['content.js']);
  for (const key of ['permissions', 'host_permissions', 'background']) expect(m).not.toHaveProperty(key);
});
