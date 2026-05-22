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
import { translate } from 'google-translate-api-x';

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
  'zh-Hans': 'zh-CN',
  ar: 'ar',
};

// Fields that must NOT be translated
// 'level' must stay English because levelColor() switch uses English strings (Beginner/Intermediate/Advanced)
const EXERCISE_SKIP = new Set(['id', 'level', 'reps', 'exerciseIds', 'accessLevel']);
const PROGRAM_SKIP  = new Set(['id', 'level', 'accessLevel', 'exerciseIds']);

// ─── Translation helpers ─────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Recursively flatten all translatable strings from an object into a list,
 * recording exact property/index paths so we can write translations back.
 */
function extractStrings(obj, skipKeys) {
  const strings = [];
  const paths = [];

  function walk(node, path = []) {
    if (typeof node === 'string') {
      if (node.trim()) {
        strings.push(node);
        paths.push(path);
      }
      return;
    }

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        walk(node[i], [...path, i]);
      }
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (skipKeys.has(key)) continue;
      walk(value, [...path, key]);
    }
  }

  walk(obj);
  return { strings, paths };
}

function applyTranslations(obj, strings, paths) {
  const out = JSON.parse(JSON.stringify(obj));

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    let cursor = out;
    for (let j = 0; j < path.length - 1; j++) {
      cursor = cursor[path[j]];
      if (cursor === undefined || cursor === null) break;
    }
    if (cursor === undefined || cursor === null) continue;
    cursor[path[path.length - 1]] = strings[i];
  }

  return out;
}

const MAX_CHUNK_CHARS = 1800;

async function translateChunk(strings, to, retries = 10) {
  const token = `[[[PILATESAFE_SPLIT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}]]]`;
  const joined = strings.join(`\n${token}\n`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await translate(joined, { from: 'en', to, forceTo: true });
      const parts = result.text.split(token).map(s => s.trim());
      if (parts.length === strings.length) {
        return parts;
      }

      // Fallback parser: index each line and recover by marker if token mutated.
      const indexedToken = '[[';
      const indexedJoined = strings.map((s, i) => `${indexedToken}${i}]] ${s}`).join('\n');
      const indexedResult = await translate(indexedJoined, { from: 'en', to, forceTo: true });
      const recovered = new Array(strings.length).fill('');
      const markerRegex = /\[\[(\d+)\]\]\s*/g;
      let currentIndex = -1;
      let cursor = 0;
      let match;

      while ((match = markerRegex.exec(indexedResult.text)) !== null) {
        const idx = Number(match[1]);
        if (currentIndex >= 0) {
          recovered[currentIndex] = indexedResult.text.slice(cursor, match.index).trim();
        }
        currentIndex = idx;
        cursor = markerRegex.lastIndex;
      }
      if (currentIndex >= 0) {
        recovered[currentIndex] = indexedResult.text.slice(cursor).trim();
      }

      if (recovered.every(Boolean) && recovered.length === strings.length) {
        return recovered;
      }

      throw new Error(`Could not recover split markers for ${strings.length} strings`);
    } catch (err) {
      if (attempt === retries) throw err;
      const isRateLimit = /too many|429|rate/i.test(err.message);
      const wait = isRateLimit ? Math.min(attempt * 60000, 300000) : attempt * 10000;
      process.stdout.write(`\n  [retry ${attempt}/${retries}] ${err.message.slice(0, 70)}… waiting ${wait / 1000}s`);
      await sleep(wait);
    }
  }

  return strings;
}

async function batchTranslateWithRetry(strings, to) {
  if (strings.length === 0) return [];
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const s of strings) {
    if (current.length > 0 && currentLen + s.length > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = [s];
      currentLen = s.length;
    } else {
      current.push(s);
      currentLen += s.length;
    }
  }
  if (current.length) chunks.push(current);

  const translated = [];
  for (let i = 0; i < chunks.length; i++) {
    translated.push(...await translateChunk(chunks[i], to));
    if (i < chunks.length - 1) {
      await sleep(1200);
    }
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
    await sleep(2500);
  }
  console.log(`  exercises ${exercises.length}/${exercises.length} ✓                       `);
  return results;
}

// ─── Conditions translation ──────────────────────────────────────────────────

async function translateConditions(conditions, langCode) {
  // conditions: Array<{ id, label, description }> — translate label + description
  const COND_SKIP = new Set(['id']);
  const results = [];
  for (let i = 0; i < conditions.length; i++) {
    process.stdout.write(`  condition ${i + 1}/${conditions.length}        \r`);
    const { strings, paths } = extractStrings(conditions[i], COND_SKIP);
    if (strings.length === 0) { results.push(conditions[i]); continue; }
    const translated = await batchTranslateWithRetry(strings, langCode);
    results.push(applyTranslations(conditions[i], translated, paths));
    await sleep(1000);
  }
  console.log(`  conditions ${conditions.length}/${conditions.length} ✓                       `);
  return results;
}

// ─── Contraindications translation ───────────────────────────────────────────

async function translateContraindications(contraindications, langCode) {
  // contraindications: { [conditionId]: Array<{ exerciseId, reason, alternative }> }
  const CONTRA_SKIP = new Set(['exerciseId']);
  const result = {};
  const condIds = Object.keys(contraindications);
  for (let i = 0; i < condIds.length; i++) {
    const condId = condIds[i];
    process.stdout.write(`  contraindication ${i + 1}/${condIds.length} (${condId})        \r`);
    const entries = contraindications[condId];
    const translatedEntries = [];
    for (const entry of entries) {
      const { strings, paths } = extractStrings(entry, CONTRA_SKIP);
      if (strings.length === 0) { translatedEntries.push(entry); continue; }
      const translated = await batchTranslateWithRetry(strings, langCode);
      translatedEntries.push(applyTranslations(entry, translated, paths));
      await sleep(600);
    }
    result[condId] = translatedEntries;
  }
  console.log(`  contraindications ${condIds.length}/${condIds.length} ✓                       `);
  return result;
}



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
    await sleep(1500);
  }
  console.log(`  programs ${programs.length}/${programs.length} ✓                       `);
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const exercises      = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/data/exercises.json'), 'utf8'));
const programs       = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/data/programs.json'), 'utf8'));
const conditions     = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/data/safety-conditions.json'), 'utf8'));
const contraindications = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/data/contraindications.json'), 'utf8'));

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
  const exercisesOut        = path.join(outDir, 'exercises.json');
  const programsOut         = path.join(outDir, 'programs.json');
  const conditionsOut       = path.join(outDir, 'safety-conditions.json');
  const contraindicationsOut = path.join(outDir, 'contraindications.json');

  if (fs.existsSync(exercisesOut) && fs.existsSync(programsOut) &&
      fs.existsSync(conditionsOut) && fs.existsSync(contraindicationsOut)) {
    console.log(`[${appLang}] already complete — skipping (delete the folder to re-run)`);
    continue;
  }

  console.log(`\n[${appLang}] Translating ${exercises.length} exercises + ${programs.length} programs + ${conditions.length} conditions + ${Object.keys(contraindications).length} contraindication groups…`);
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

    if (!fs.existsSync(conditionsOut)) {
      const translated = await translateConditions(conditions, googleLang);
      fs.writeFileSync(conditionsOut, JSON.stringify(translated, null, 2));
      console.log(`  → wrote ${conditionsOut}`);
    }

    if (!fs.existsSync(contraindicationsOut)) {
      const translated = await translateContraindications(contraindications, googleLang);
      fs.writeFileSync(contraindicationsOut, JSON.stringify(translated, null, 2));
      console.log(`  → wrote ${contraindicationsOut}`);
    }

    console.log(`[${appLang}] done ✓`);
  } catch (err) {
    console.error(`\n[${appLang}] failed: ${err.message}`);
    console.error('Progress saved — re-run to resume: node scripts/translate-data.mjs ' + appLang);
    process.exit(1);
  }
}

console.log('\nAll done.');
