/**
 * Translates only the NEW keys (missing from other language files) from en.json
 * into all supported languages using google-translate-api-x.
 * Run: node scripts/translate-i18n-new-keys.mjs
 */
import { translate } from 'google-translate-api-x';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = resolve(__dirname, '../src/assets/i18n');

const LANGS = ['es', 'fr', 'de', 'pt', 'it', 'ja', 'zh-Hans', 'ar'];

const LANG_CODE_MAP = {
  'es': 'es',
  'fr': 'fr',
  'de': 'de',
  'pt': 'pt',
  'it': 'it',
  'ja': 'ja',
  'zh-Hans': 'zh-CN',
  'ar': 'ar',
};

// Collect all leaf key paths from an object: { 'SECTION.KEY': 'value' }
function flattenKeys(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      result[fullKey] = v;
    } else if (typeof v === 'object' && v !== null) {
      Object.assign(result, flattenKeys(v, fullKey));
    }
  }
  return result;
}

// Set a nested key like 'SECTION.KEY' in an object
function setNestedKey(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

async function translateText(text, to) {
  try {
    const res = await translate(text, { from: 'en', to });
    return res.text;
  } catch (e) {
    console.warn(`  ⚠ Translate failed for "${text.substring(0, 40)}...": ${e.message}`);
    return text; // fallback to English
  }
}

async function processLang(lang) {
  const gtLang = LANG_CODE_MAP[lang];
  const filePath = `${I18N_DIR}/${lang}.json`;

  const enData = JSON.parse(readFileSync(`${I18N_DIR}/en.json`, 'utf8'));
  let langData;
  try {
    langData = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    langData = {};
  }

  const enFlat = flattenKeys(enData);
  const langFlat = flattenKeys(langData);

  // Find keys present in en but missing in lang
  const missingKeys = Object.keys(enFlat).filter(k => !(k in langFlat));

  if (missingKeys.length === 0) {
    console.log(`[${lang}] No missing keys.`);
    return;
  }

  console.log(`[${lang}] ${missingKeys.length} missing keys to translate...`);

  for (const key of missingKeys) {
    const enValue = enFlat[key];
    process.stdout.write(`  ${key}: `);
    const translated = await translateText(enValue, gtLang);
    console.log(`"${translated.substring(0, 60)}${translated.length > 60 ? '...' : ''}"`);
    setNestedKey(langData, key, translated);

    // Add a small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  writeFileSync(filePath, JSON.stringify(langData, null, 2) + '\n', 'utf8');
  console.log(`[${lang}] ✓ Written ${missingKeys.length} new keys.`);
}

async function main() {
  const targetLangs = process.argv.slice(2).length > 0 ? process.argv.slice(2) : LANGS;
  console.log(`Translating missing i18n keys for: ${targetLangs.join(', ')}\n`);

  for (const lang of targetLangs) {
    await processLang(lang);
    console.log();
  }

  console.log('Done!');
}

main().catch(console.error);
