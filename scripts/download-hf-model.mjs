import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const MODEL_ID = process.argv[2] || 'Xenova/flan-t5-small';
const REVISION = process.argv[3] || 'main';
const VARIANT = (process.argv[4] || 'minimal').toLowerCase(); // 'minimal' | 'all'
const OUT_ROOT = path.join(process.cwd(), 'src', 'assets', 'models', MODEL_ID);

const ALLOW_EXT = new Set(['.json', '.txt', '.model', '.vocab', '.tiktoken', '.md', '.onnx']);

const EXCLUDE_NAMES = new Set([
  'pytorch_model.bin',
  'model.safetensors',
  'tf_model.h5',
  'rust_model.ot',
  'flax_model.msgpack'
]);

const REQUIRED_TEXT_FILES = new Set([
  'config.json',
  'generation_config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'special_tokens_map.json',
  'preprocessor_config.json'
]);

const MINIMAL_ONNX_FILES = new Set([
  // Most Xenova seq2seq models use these names.
  'onnx/encoder_model_quantized.onnx',
  'onnx/decoder_model_merged_quantized.onnx',
  'onnx/decoder_with_past_model_quantized.onnx'
]);

function shouldDownload(filePath) {
  const base = path.posix.basename(filePath);
  if (EXCLUDE_NAMES.has(base)) return false;
  if (filePath.startsWith('.')) return false;
  if (filePath.includes('/.')) return false;

  if (VARIANT === 'minimal') {
    if (REQUIRED_TEXT_FILES.has(base)) return true;
    if (filePath === 'spiece.model') return true;
    if (MINIMAL_ONNX_FILES.has(filePath)) return true;
    return false;
  }

  if (filePath.startsWith('onnx/')) return true;
  if (filePath.startsWith('tokenizer')) return true;
  if (filePath.startsWith('special_tokens_map')) return true;
  if (filePath.startsWith('spiece')) return true;
  const ext = path.posix.extname(filePath);
  return ALLOW_EXT.has(ext);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

async function downloadFile(filePath) {
  const destPath = path.join(OUT_ROOT, filePath);
  if (existsSync(destPath)) {
    return;
  }

  await mkdir(path.dirname(destPath), { recursive: true });

  const url = `https://huggingface.co/${MODEL_ID}/resolve/${REVISION}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ${filePath}: HTTP ${res.status} ${res.statusText}`);
  }

  await pipeline(res.body, createWriteStream(destPath));
}

async function main() {
  if (VARIANT !== 'minimal' && VARIANT !== 'all') {
    throw new Error(`Unknown variant "${VARIANT}". Use "minimal" (default) or "all".`);
  }

  console.log(`Downloading model snapshot (${VARIANT}) for ${MODEL_ID}@${REVISION}`);
  console.log(`Output: ${OUT_ROOT}`);

  await mkdir(OUT_ROOT, { recursive: true });

  const apiUrl = `https://huggingface.co/api/models/${MODEL_ID}?expand[]=siblings&revision=${encodeURIComponent(REVISION)}`;
  const modelInfo = await fetchJson(apiUrl);
  const siblings = Array.isArray(modelInfo?.siblings) ? modelInfo.siblings : [];
  const paths = siblings.map(s => s?.rfilename).filter(Boolean);
  const selected = paths.filter(shouldDownload);

  if (selected.length === 0) {
    throw new Error(`No files selected for ${MODEL_ID}. Model API returned ${paths.length} paths.`);
  }

  const manifest = {
    modelId: MODEL_ID,
    revision: REVISION,
    downloadedAt: new Date().toISOString(),
    files: selected
  };
  await writeFile(path.join(OUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  let completed = 0;
  for (const filePath of selected) {
    await downloadFile(filePath);
    completed += 1;
    if (completed % 10 === 0 || completed === selected.length) {
      console.log(`Downloaded ${completed}/${selected.length}`);
    }
  }

  console.log('Done.');
  console.log('Next: build and test on device in Airplane Mode.');
}

main().catch(err => {
  console.error(err?.stack || err);
  process.exitCode = 1;
});
