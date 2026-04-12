# On-device AI models

This app can run AI **fully offline** (on-device) using a Transformers.js model bundled in the app.

## Download (recommended)

Run:

`npm run -s ai:model:download`

This downloads the default small model into `src/assets/models/...` using a **minimal** set of files (to keep the app size down).

This app is configured to use only the small model, so download the model with:

`npm run -s ai:model:download`

If you previously downloaded an older snapshot that included many ONNX variants, delete the folder and re-download:

`rm -rf src/assets/models/Xenova/flan-t5-small && npm run -s ai:model:download`

## Expected folder structure

The default model id is `Xenova/flan-t5-small`, so the files should live at:

`src/assets/models/Xenova/flan-t5-small/*`

That folder should include the model's config/tokenizer files plus the ONNX weights files expected by Transformers.js.

## Configuration

See:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
