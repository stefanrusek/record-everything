import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const verified =
  existsSync(join(dir, 'live-verification.md')) && existsSync(join(dir, 'live-reverification.md'));
if (!verified) {
  console.log(
    'NOTE: tests/fixtures/meet/ stands in for live Meet; the tests are still on fixtures until live-verification.md and live-reverification.md exist.',
  );
}
