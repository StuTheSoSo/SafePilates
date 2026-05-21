/**
 * translate-data.mjs
 *
 * Translates exercises.json and programs.json into all supported languages
 * using Google Translate (free, no API key required) and saves them to
 * src/assets/data/{lang}/.
 *
 * Usage:
 *   node scripts/translate-data.mjs          # all languages
 *   node scripts/translate-data.mjs es       # single language
 *   node scripts/translate-data.mjs es fr de # multiple languages
 *
 * Requires Node 18+ and: npm install google-translate-api-x --save-dev
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate, batchTranslate } from 'google-translate-api-x';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Config ─────────────────────────────────────────────────────────────────

// App lang code → Google Translate lang code
const LANGUAGES = {
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  it: 'it',
  ja: 'ja',
  'zh-Hans': 'zh-cn',
  ar: 'ar',
};

// Fields that must NOT be translated
// 'level' must stay English because levelColor() switch uses English strings (Beginner/Intermediate/Advanced)
const EXERCISE_SKIP = new Set(['id', 'level', 'reps', 'exerciseIds', 'accessLevel']);
const PROGRAM_SKIP  = new Set(['id', 'level', 'accessLevel', 'exerciseIds']);

// ─── Translation helpers ─────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Flatten all translatable strings from an object into a list,
 * recording a "path" so we can put them back.
 * paths entries: { path: [...keys], index?: number, subIndex?: number }
 */
function extractStrings(obj, skipKeys) {
  const strings = [];
  const paths = [];

  for (const [key, value] of Object.entries(obj)) {
    if (skipKeys.has(key)) continue;
    if (typeof value === 'string' && value.trim()) {
      strings.push(value);
      paths.push({ key, type: 'string' });
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'string' && item.trim()) {
          strings.push(item);
          paths.push({ key, type: 'array', index: i });
        } else if (Array.isArray(item)) {
          for (let j = 0; j < item.length; j++) {
            if (typeof item[j] === 'string' && item[j].trim()) {
              strings.push(item[j]);
              paths.push({ key, type: 'nestedArray', index: i, subIndex: j });
            }
          }
        }
      }
    } else if (key === 'repRanges' && typeof value === 'object' && value !== null && value.notes) {
      strings.push(value.notes);
      paths.push({ key, type: 'repRanges' });
    }
  }
  return { strings, paths };
}

function applyTranslations(obj, strings, paths) {
  const out = { ...obj };
  // Clone arrays to avoid mutating originals
  for (const p of paths) {
    if (p.type === 'array' || p.type === 'nestedArray') {
      if (!Array.isArray(out[p.key])) continue;
      out[p.key] = out[p.key].map(item =>
        Array.isArray(item) ? [...item] : item
      );
    }
  }

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    const translated = strings[i];
    if (p.type === 'string') {
      out[p.key] = translated;
    } else if (p.type === 'array') {
      out[p.key][p.index] = translated;
    } else if (p.type === 'nestedArray') {
      out[p.key][p.index][p.subIndex] = translated;
    } else if (p.type === 'repRanges') {
      out[p.key] = { ...out[p.key], notes: translated };
    }
  }
  return out;
}

const SEP = '\n---SEP---\n';
const MAX_CHUNK_CHARS = 1500;

async function translateChunk(strings, to, retries = 4) {
  const joined = strings.join(SEP);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await translate(joined, { from: 'en', to });
      const parts = result.text.split('---SEP---').map(s => s.trim());
      if (parts.length !== strings.length) {
        // Separator was mangled by Google Translate — fall back to one-by-one for this chunk
        process.stdout.write(`\n  Separator lost for ${strings.length} strings, translating individually…\r`);
        const individual = [];
        for (const s of strings) {
          const r = await translate(s, { from: 'en', to });
          individual.push(r.text);
          await sleep(200);
        }
        return individual;
      }
      return parts;
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = attempt * 2000;
      process.stdout.write(`  [retry ${attempt}] ${err.message.substring(0, 60)}… waiting ${wait / 1000}s\r`);
      await sleep(wait);
    }
  }
}

async function batchTranslateWithRetry(strings, to) {
  if (strings.length === 0) return [];
  // Split into chunks that stay under the API character limit
  const chunks = [];
  let current = [];
  let currentLen = 0;
  for (const s of strings) {
    if (current.length > 0 && currentLen + s.length + SEP.length > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = [s];
      currentLen = s.length;
    } else {
      current.push(s);
      currentLen += s.length + SEP.length;
    }
  }
  if (current.length) chunks.push(current);

  const translated = [];
  for (const chunk of chunks) {
    const results = await translateChunk(chunk, to);
    translated.push(...results);
    if (chunks.length > 1) await sleep(200);
  }
  return translated;
}

// ─── Exercise translation ────────────────────────────────────────────────────

async function translateExercise(ex, to) {
  const { strings, paths } = extractStrings(ex, EXERCISE_SKIP);
  if (strings.length === 0) return ex;
  const translated = await batchTranslateWithRetry(strings, to);
  return applyTranslations(ex, translated, paths);
}

async function translateExercises(exercises, langCode, wipFile) {
  // Resume from checkpoint if available
  let results = [];
  if (fs.existsSync(wipFile)) {
    results = JSON.parse(fs.readFileSync(wipFile, 'utf8'));
    console.log(`  Resuming from exercise ${results.length + 1}/${exercises.length}`);
  }
  for (let i = results.length; i < exercises.length; i++) {
    process.stdout.write(`  exercise ${i + 1}/${exercises.length} (${exercises[i].id})        \r`);
    results.push(await translateExercise(exercises[i], langCode));
    fs.writeFileSync(wipFile, JSON.stringify(results, null, 2)); // checkpoint after each exercise
    await sleep(300);
  }
  console.log(`  exercises ${exercises.length}/${exercises.length} ✓                       `);
  return results;
}

// ─── Program translation ─────────────────────────────────────────────────────

async function translateProgram(p, to) {
  const { strings, paths } = extractStrings(p, PROGRAM_SKIP);
  if (strings.length === 0) return p;
  const translated = await batchTranslateWithRetry(strings, to);
  return applyTranslations(p, translated, paths);
}

async function translatePrograms(programs, langCode) {
  const results = [];
  for (let i = 0; i < programs.length; i++) {
    process.stdout.write(`  program ${i + 1}/${programs.length} (${programs[i].id})        \r`);
    results.push(await translateProgram(programs[i], langCode));
    await sleep(300);
  }
  console.log(`  programs ${programs.length}/${programs.length} ✓                       `);
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const exercises = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/assets/data/exercises.json'), 'utf8')
);
const programs = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/assets/data/programs.json'), 'utf8')
);

const targetLangs =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : Object.keys(LANGUAGES);

const unknownLangs = targetLangs.filter((l) => !LANGUAGES[l]);
if (unknownLangs.length) {
  console.error(`Unknown language code(s): ${unknownLangs.join(', ')}`);
  console.error(`Supported: ${Object.keys(LANGUAGES).join(', ')}`);
  process.exit(1);
}

for (const appLang of targetLangs) {
  const googleLang = LANGUAGES[appLang];
  const outDir = path.join(ROOT, 'src/assets/data', appLang);
  const exercisesOut = path.join(outDir, 'exercises.json');
  const programsOut  = path.join(outDir, 'programs.json');

  if (fs.existsSync(exercisesOut) && fs.existsSync(programsOut)) {
    console.log(`[${appLang}] already complete — skipping (delete the folder to re-run)`);
    continue;
  }

  console.log(`\n[${appLang}] Translating ${exercises.length} exercises + ${programs.length} programs…`);
  fs.mkdirSync(outDir, { recursive: true });

  const exercisesWip = exercisesOut + '.wip';

  try {
    if (!fs.existsSync(exercisesOut)) {
      const translated = await translateExercises(exercises, googleLang, exercisesWip);
      fs.writeFileSync(exercisesOut, JSON.stringify(translated, null, 2));
      if (fs.existsSync(exercisesWip)) fs.unlinkSync(exercisesWip);
      console.log(`  → wrote ${exercisesOut}`);
    }

    if (!fs.existsSync(programsOut)) {
      const translated = await translatePrograms(programs, googleLang);
      fs.writeFileSync(programsOut, JSON.stringify(translated, null, 2));
      console.log(`  → wrote ${programsOut}`);
    }

    console.log(`[${appLang}] done ✓`);
  } catch (err) {
    console.error(`\n[${appLang}] failed: ${err.message}`);
    console.error('Progress saved — re-run to resume: node scripts/translate-data.mjs ' + appLang);
    process.exit(1);
  }
}

console.log('\nAll done.');
