import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from 'google-translate-api-x';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/assets/data');

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

const FILES = [
  {
    name: 'safety-conditions.json',
    skipKeys: new Set(['id', 'hasTrimester']),
  },
  {
    name: 'exercises.json',
    skipKeys: new Set(['id', 'level', 'videoUrl']),
  },
  {
    name: 'contraindications.json',
    skipKeys: new Set(['exerciseId']),
  },
  {
    name: 'programs.json',
    skipKeys: new Set(['id', 'level', 'accessLevel', 'exerciseIds']),
  },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getAtPath(root, parts) {
  return parts.reduce((cursor, part) => cursor?.[part], root);
}

function setAtPath(root, parts, value) {
  let cursor = root;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cursor[parts[i]] === undefined) {
      cursor[parts[i]] = typeof parts[i + 1] === 'number' ? [] : {};
    }
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
}

function extractStrings(root, skipKeys) {
  const entries = [];

  function walk(node, parts = []) {
    if (typeof node === 'string') {
      if (node.trim()) {
        entries.push({ parts, text: node });
      }
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, [...parts, index]));
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (skipKeys.has(key)) {
        continue;
      }
      walk(value, [...parts, key]);
    }
  }

  walk(root);
  return entries;
}

function chunkEntries(entries, maxChars = 2600) {
  const chunks = [];
  let current = [];
  let length = 0;

  for (const entry of entries) {
    const nextLength = length + entry.text.length + 16;
    if (current.length && nextLength > maxChars) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(entry);
    length += entry.text.length + 16;
  }

  if (current.length) {
    chunks.push(current);
  }

  return chunks;
}

function parseIndexedTranslation(text, count) {
  const normalized = text.replace(/［/g, '[').replace(/］/g, ']');
  const marker = /\[\[\s*(\d+)\s*\]\]/g;
  const matches = [...normalized.matchAll(marker)];
  if (matches.length !== count) {
    return null;
  }

  const values = new Array(count);
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const index = Number(current[1]);
    values[index] = normalized
      .slice(current.index + current[0].length, next?.index ?? normalized.length)
      .trim();
  }

  return values.every(value => typeof value === 'string' && value.length > 0)
    ? values
    : null;
}

async function translateChunk(entries, to) {
  const translateTextWithRetry = async (text) => {
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        const result = await translate(text, { from: 'en', to, forceTo: true });
        return result.text.trim();
      } catch (error) {
        if (attempt === 6) {
          throw error;
        }
        const wait = /429|too many|rate/i.test(error.message) ? attempt * 30000 : attempt * 3000;
        process.stdout.write(` retry ${attempt} in ${Math.round(wait / 1000)}s`);
        await sleep(wait);
      }
    }
    return text;
  };

  // RTL output can mutate marker tokens and break chunk parsing, so translate
  // Arabic entries individually for reliability.
  if (entries.length === 1 || to === 'ar') {
    const results = [];
    for (const entry of entries) {
      results.push(await translateTextWithRetry(entry.text));
    }
    return results;
  }

  const joined = entries.map((entry, index) => `[[${index}]] ${entry.text}`).join('\n');
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const result = await translate(joined, { from: 'en', to, forceTo: true });
      const parsed = parseIndexedTranslation(result.text, entries.length);
      if (parsed) {
        return parsed;
      }
      if (entries.length > 2) {
        const middle = Math.ceil(entries.length / 2);
        const first = await translateChunk(entries.slice(0, middle), to);
        const second = await translateChunk(entries.slice(middle), to);
        return [...first, ...second];
      }
      throw new Error('Could not parse translated chunk markers');
    } catch (error) {
      if (attempt === 6) {
        throw error;
      }
      const wait = /429|too many|rate/i.test(error.message) ? attempt * 30000 : attempt * 3000;
      process.stdout.write(` retry ${attempt} in ${Math.round(wait / 1000)}s`);
      await sleep(wait);
    }
  }

  return entries.map(entry => entry.text);
}

async function translateFile(source, existingTarget, skipKeys, googleLang, checkpointPath) {
  const output = clone(source);
  if (existingTarget) {
    for (const entry of extractStrings(source, skipKeys)) {
      const existing = getAtPath(existingTarget, entry.parts);
      if (typeof existing === 'string' && existing.trim() && existing !== entry.text) {
        setAtPath(output, entry.parts, existing);
      }
    }
  }
  const sourceEntries = extractStrings(source, skipKeys);
  const missingEntries = sourceEntries.filter(entry => {
    const current = getAtPath(output, entry.parts);
    return typeof current !== 'string' || current === entry.text;
  });

  const chunks = chunkEntries(missingEntries);
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(` chunk ${i + 1}/${chunks.length}\r`);
    const translated = await translateChunk(chunks[i], googleLang);
    chunks[i].forEach((entry, index) => setAtPath(output, entry.parts, translated[index]));
    if (checkpointPath) {
      writeJson(checkpointPath, output);
    }
    await sleep(600);
  }

  return output;
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

const targetLangs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Object.keys(LANGUAGES);

for (const lang of targetLangs) {
  if (!LANGUAGES[lang]) {
    throw new Error(`Unknown language "${lang}". Supported: ${Object.keys(LANGUAGES).join(', ')}`);
  }
}

for (const lang of targetLangs) {
  const googleLang = LANGUAGES[lang];
  console.log(`\n[${lang}]`);

  for (const fileConfig of FILES) {
    const sourcePath = path.join(DATA_DIR, fileConfig.name);
    const targetPath = path.join(DATA_DIR, lang, fileConfig.name);
    const wipPath = `${targetPath}.wip`;
    const legacyWipPath = path.join(DATA_DIR, lang, `${fileConfig.name}.wip`);

    if (fs.existsSync(targetPath)) {
      console.log(`  ${fileConfig.name}: exists`);
      continue;
    }

    const source = loadJson(sourcePath);
    const existing = fs.existsSync(wipPath)
      ? loadJson(wipPath)
      : fs.existsSync(legacyWipPath)
        ? loadJson(legacyWipPath)
        : null;

    process.stdout.write(`  ${fileConfig.name}: translating`);
    const translated = await translateFile(source, existing, fileConfig.skipKeys, googleLang, wipPath);
    writeJson(targetPath, translated);
    if (fs.existsSync(wipPath)) fs.unlinkSync(wipPath);
    console.log(`  ${fileConfig.name}: wrote`);
  }
}

console.log('\nDone.');
