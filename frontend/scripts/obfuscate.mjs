/**
 * Post-build obfuscation script.
 * Run after `ng build`: npm run obfuscate
 * Or use the combined script: npm run build:obfuscate
 *
 * Requires: npm install --save-dev javascript-obfuscator
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let JavaScriptObfuscator;
try {
  JavaScriptObfuscator = require('javascript-obfuscator');
} catch {
  console.error('\n[obfuscate] ERROR: javascript-obfuscator is not installed.');
  console.error('[obfuscate] Run: npm install --save-dev javascript-obfuscator\n');
  process.exit(1);
}

// Angular 17+ application builder outputs to browser/ subfolder
const DIST_DIR = join(process.cwd(), 'dist', 'myshop-frontend', 'browser');

const OBFUSCATOR_OPTIONS = {
  // Keep compact — remove all whitespace/newlines
  compact: true,

  // Rename all identifiers to hex strings like _0x1a2b
  identifierNamesGenerator: 'hexadecimal',

  // Move all string literals into an encoded array
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,

  // Split long strings into concatenated chunks
  splitStrings: true,
  splitStringsChunkLength: 8,

  // Simplify expressions (e.g. true → !0, false → !1)
  simplify: true,

  // Strip console.* calls from production
  disableConsoleOutput: true,

  // MUST stay false — renaming globals breaks Angular's bootstrap
  renameGlobals: false,

  // Keep off — control flow flattening can break Angular's change detection
  controlFlowFlattening: false,

  // Keep off — self-defending wraps everything in an eval loop, breaks lazy routes
  selfDefending: false,

  // Keep off — significantly increases bundle size
  deadCodeInjection: false,

  // No unicode escapes — increases size without benefit
  unicodeEscapeSequence: false,
};

async function findJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

async function obfuscateFile(filePath) {
  const source = await readFile(filePath, 'utf8');
  const before = source.length;
  const result = JavaScriptObfuscator.obfuscate(source, OBFUSCATOR_OPTIONS);
  const obfuscated = result.getObfuscatedCode();
  await writeFile(filePath, obfuscated, 'utf8');
  const after = obfuscated.length;
  const delta = ((after - before) / before * 100).toFixed(1);
  const sign = delta >= 0 ? '+' : '';
  console.log(`  ✓  ${relative(process.cwd(), filePath).padEnd(60)} ${sign}${delta}%`);
}

async function main() {
  let files;
  try {
    files = await findJsFiles(DIST_DIR);
  } catch {
    console.error(`\n[obfuscate] Dist directory not found: ${DIST_DIR}`);
    console.error('[obfuscate] Run ng build first.\n');
    process.exit(1);
  }

  if (!files.length) {
    console.error('[obfuscate] No .js files found in dist.');
    process.exit(1);
  }

  console.log(`\nObfuscating ${files.length} JS file(s) in ${DIST_DIR}\n`);
  const start = Date.now();

  // Obfuscate sequentially — parallel would thrash memory on large bundles
  for (const file of files) {
    await obfuscateFile(file);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s. Deploy the dist/ folder as usual.\n`);
}

main().catch(err => {
  console.error('[obfuscate]', err.message);
  process.exit(1);
});
