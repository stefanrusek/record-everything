import { copyFileSync, mkdirSync } from 'node:fs';
import { build } from 'esbuild';

mkdirSync('dist', { recursive: true });
await build({
  stdin: {
    contents: 'import { start } from "./src/content.ts"; start(document);',
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  format: 'iife',
  outfile: 'dist/content.js',
});
copyFileSync('manifest.json', 'dist/manifest.json');
