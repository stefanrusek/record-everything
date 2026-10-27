import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const run = (dir: string) =>
  execFileSync('node', ['scripts/fixture-banner.mjs', dir], { encoding: 'utf8' });

it('prints the banner when evidence is missing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'banner-'));
  writeFileSync(join(dir, 'live-verification.md'), 'x');
  const out = run(dir);
  expect(out).toContain('tests/fixtures/meet/');
  expect(out).toContain('still on fixtures');
});

it('prints nothing when both evidence files exist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'banner-'));
  writeFileSync(join(dir, 'live-verification.md'), 'x');
  writeFileSync(join(dir, 'live-reverification.md'), 'x');
  expect(run(dir)).toBe('');
});
