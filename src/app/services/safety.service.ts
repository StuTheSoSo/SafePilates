import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Condition, Exercise, Contraindication, GuidanceResult, SafetyQuery, ConditionResult } from '../models';
import { environment } from '../../environments/environment';
import safetyConditionsData from '../../assets/data/safety-conditions.json' with { type: 'json' };
import exercisesData from '../../assets/data/exercises.json' with { type: 'json' };
import contraindicationsData from '../../assets/data/contraindications.json' with { type: 'json' };

type AiProvider = 'none' | 'local';

@Injectable({ providedIn: 'root' })
export class SafetyService {
  private http = inject(HttpClient);
  private conditions: Condition[] = [];
  private exercises: Exercise[] = [];
  private contraindications: Record<string, Contraindication[]> = {};
  private dataLoaded = false;
  private latestQuery: SafetyQuery | null = null;
  private latestGuidance: GuidanceResult | null = null;

  async initData(): Promise<void> {
    if (this.dataLoaded) {
      return;
    }

    // Use bundled JSON data immediately for the first render,
    // then try to refresh from assets if available.
    this.conditions = safetyConditionsData as Condition[];
    this.exercises = exercisesData as Exercise[];
    this.contraindications = contraindicationsData as Record<string, Contraindication[]>;

    try {
      const [conditions, exercises, contraindications] = await Promise.all([
        firstValueFrom(this.http.get<Condition[]>('/assets/data/safety-conditions.json')),
        firstValueFrom(this.http.get<Exercise[]>('/assets/data/exercises.json')),
        firstValueFrom(this.http.get<Record<string, Contraindication[]>>('/assets/data/contraindications.json'))
      ]);

      if (conditions?.length) {
        this.conditions = conditions;
      }
      if (exercises?.length) {
        this.exercises = exercises;
      }
      if (contraindications && Object.keys(contraindications).length) {
        this.contraindications = contraindications;
      }
    } catch (error) {
      console.warn('Safety data load failed, using bundled fallback data', error);
    }

    this.dataLoaded = true;
  }

  getConditions(): Condition[] {
    return this.conditions;
  }

  getExercises(): Exercise[] {
    return this.exercises;
  }

  getExerciseById(id: string): Exercise | undefined {
    return this.exercises.find(exercise => exercise.id === id);
  }

  getSelection(): SafetyQuery | null {
    return this.latestQuery;
  }

  getGuidance(): GuidanceResult | null {
    return this.latestGuidance;
  }

  async fetchGuidance(query: SafetyQuery): Promise<GuidanceResult> {
    await this.initData();
    this.latestQuery = query;

    const selectedConditions = query.conditionIds.map(id => this.conditions.find(item => item.id === id)).filter(Boolean) as Condition[];
    const conditionResults: ConditionResult[] = selectedConditions.map(condition => ({
      conditionId: condition.id,
      conditionLabel: condition.label,
      conditionDescription: condition.description,
      contraindications: this.contraindications[condition.id] ?? []
    }));

    const noLocalData = selectedConditions.some(condition => condition.id === 'other') || conditionResults.every(result => result.contraindications.length === 0);
    let aiFallback: string | undefined;
    const aiProvider = this.getAiProvider();
    const aiAvailable = this.isAiConfigured(aiProvider);
    const aiUsed = noLocalData && aiAvailable;

    if (noLocalData) {
      aiFallback = await this.getAiFallback(aiProvider, query, selectedConditions, aiAvailable);
    }

    const result: GuidanceResult = {
      conditionResults,
      aiFallback,
      aiUsed
    };

    this.latestGuidance = result;
    return result;
  }

  private getAiProvider(): AiProvider {
    const provider = (environment as { aiProvider?: string }).aiProvider?.trim().toLowerCase();
    if (provider === 'local' || provider === 'none') {
      return provider;
    }
    return 'none';
  }

  private isAiConfigured(provider: AiProvider): boolean {
    if (provider === 'none') {
      return false;
    }
    return this.getLocalModelConfig().modelId.length > 0;
  }

  private async getAiFallback(provider: AiProvider, query: SafetyQuery, selectedConditions: Condition[], aiAvailable: boolean): Promise<string> {
    if (!aiAvailable) {
      return 'AI fallback is not configured in this build. Please consult a qualified professional for guidance or choose a listed condition for local safety guidance.';
    }

    return this.withTimeout(
      this.requestAiFallback(provider, query, selectedConditions),
      9000,
      async () => 'AI guidance is taking longer than expected. Please try again later or consult a qualified professional.'
    );
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, onTimeout: () => T | Promise<T>): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<T>(resolve => {
      timeoutHandle = setTimeout(async () => resolve(await onTimeout()), ms);
    });
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  }

  async requestAiFallback(provider: AiProvider, query: SafetyQuery, selectedConditions: Condition[]): Promise<string> {
    const dateKey = new Date().toISOString().slice(0, 10);
    const countKey = `aiCalls_${dateKey}`;
    const currentCount = Number(localStorage.getItem(countKey) || '0');

    try {
      const promptText =
        provider === 'local'
          ? this.buildLocalAiPrompt(query, selectedConditions)
          : this.buildAiPrompt(query, selectedConditions);

      const aiText =
        provider === 'local'
          ? await this.requestLocalOnDevice(promptText, query, selectedConditions)
          : 'AI fallback is disabled. Please consult a qualified professional for guidance.';

      localStorage.setItem(countKey, String(currentCount + 1));
      return aiText;
    } catch (error) {
      console.error('AI fallback error', error);
      return 'Unable to reach AI guidance at this time. Please consult a qualified professional for more details.';
    }
  }

  private localPipelinePromise: Promise<any> | null = null;

  private getLocalModelConfig(): { modelId: string; modelBasePath: string; wasmBasePath: string } {
    const envAny = environment as unknown as { localModelId?: string; localModelBasePath?: string; localWasmBasePath?: string };
    return {
      modelId: (envAny.localModelId || '').trim(),
      modelBasePath: (envAny.localModelBasePath || '/assets/models').trim().replace(/\/+$/, ''),
      wasmBasePath: (envAny.localWasmBasePath || '/assets/onnx').trim().replace(/\/+$/, '')
    };
  }

  private async requestLocalOnDevice(promptText: string, query: SafetyQuery, selectedConditions: Condition[]): Promise<string> {
    const { modelId, modelBasePath, wasmBasePath } = this.getLocalModelConfig();
    if (!modelId) {
      return 'On-device AI is enabled but no local model is configured. Please bundle a model under assets and set localModelId.';
    }

    const clippedPrompt = this.clipPrompt(promptText, 900);

    try {
      const pipeline = await this.getLocalPipeline(modelId, modelBasePath, wasmBasePath);

      // Attempt 1: deterministic + concise.
      let text = await this.generateLocal(pipeline, clippedPrompt, {
        max_new_tokens: 260,
        temperature: 0.2,
        repetition_penalty: 1.15,
        no_repeat_ngram_size: 3,
        num_beams: 3
      });

      // Attempt 2: sampling can help when beam search collapses to a generic disclaimer.
      if (!text || this.isClearlyBadLocalOutput(text) || text.length < 120) {
        text = await this.generateLocal(pipeline, clippedPrompt, {
          max_new_tokens: 320,
          do_sample: true,
          top_p: 0.9,
          temperature: 0.7,
          repetition_penalty: 1.12,
          no_repeat_ngram_size: 3
        });
      }

      if (!text) {
        return this.buildHeuristicGuidance(query, selectedConditions);
      }
      if (this.isClearlyBadLocalOutput(text) || text.length < 80) {
        return this.buildHeuristicGuidance(query, selectedConditions);
      }
      return text;
    } catch (error) {
      console.error('On-device AI error', error);
      return this.buildHeuristicGuidance(query, selectedConditions);
    }
  }

  private buildHeuristicGuidance(query: SafetyQuery, selectedConditions: Condition[]): string {
    const other = (query.otherText || '').trim();
    const otherLower = other.toLowerCase();

    // If "Other" is effectively empty, fall back to a generic message.
    const contextBits: string[] = [];
    const listed = selectedConditions.filter(c => c.id !== 'other').map(c => c.label);
    if (listed.length) contextBits.push(`Listed conditions: ${listed.join(', ')}`);
    if (query.pregnancyTrimester) contextBits.push(`Trimester: ${query.pregnancyTrimester}`);
    if (other) contextBits.push(`Other: ${other}`);

    const contextLine = contextBits.length ? `Context: ${contextBits.join(' • ')}\n\n` : '';

    const disclaimer =
      'IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult your doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if you feel pain.\n\n';

    // Hamstring strain/pull pattern
    if (/(hamstring|pulled\s+hamstring|strain)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Aggressive hamstring stretching or long holds at end-range\n' +
        '- Straight-leg lifts, teaser-like work, or strong hip-hinge effort if it increases pain\n' +
        '- Deep forward folds and loaded end-range lengthening\n\n' +
        'Why\n' +
        '- Early after a strain, end-range lengthening and high load can irritate healing tissue\n' +
        '- Pain and guarding can cause compensations in the pelvis/low back\n\n' +
        'Safer focus\n' +
        '- Pain-free range only: small, controlled hip motion with knees slightly bent\n' +
        '- Gentle posterior-chain activation without strain (e.g., supported bridges within comfort)\n' +
        '- Pelvic/hip stability and breath-led core support; stop if symptoms increase\n\n' +
        'If there was a sudden “pop,” significant bruising/swelling, or difficulty walking, get medical evaluation before exercising.'
      );
    }

    // Generic injury/unknown concern fallback
    const shortOther = other ? `"${other}"` : 'this concern';
    return (
      disclaimer +
      contextLine +
      'Avoid\n' +
      '- Any movement that reproduces sharp pain, numbness/tingling, or a feeling of instability\n' +
      '- End-range stretching and heavy effort in the painful direction\n' +
      '- Fast transitions or loaded spinal flexion/rotation if symptoms worsen\n\n' +
      'Why\n' +
      '- Pain is a signal that tissue tolerance or joint control may be exceeded\n' +
      '- Moving through pain can increase irritation and slow recovery\n\n' +
      'Safer focus\n' +
      `- Keep everything in a comfortable range while you clarify ${shortOther}\n` +
      '- Choose supported, low-load patterns: breathing + gentle core activation, neutral spine work, slow controlled movement\n' +
      '- If symptoms persist, worsen, or are unclear, get clearance from a clinician before continuing'
    );
  }

  private async generateLocal(pipeline: any, prompt: string, generation: Record<string, unknown>): Promise<string> {
    const output = await pipeline(prompt, generation);
    const text = this.extractGeneratedText(output)?.trim();
    return text || '';
  }

  private isClearlyBadLocalOutput(text: string): boolean {
    const upper = text.toUpperCase();
    if (upper.includes('DISAPPEARANCE') && upper.split('DISAPPEARANCE').length - 1 >= 6) {
      return true;
    }

    // Detect extreme repetition (common failure mode in tiny on-device models).
    const words = upper
      .replace(/[^A-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    if (words.length < 10) {
      return false;
    }

    let longestRun = 1;
    let run = 1;
    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1]) {
        run += 1;
        longestRun = Math.max(longestRun, run);
      } else {
        run = 1;
      }
    }
    return longestRun >= 8;
  }

  private clipPrompt(text: string, maxChars: number): string {
    if (text.length <= maxChars) {
      return text;
    }
    return `${text.slice(0, maxChars)}\n\n(Truncated for on-device model limits.)`;
  }

  private extractGeneratedText(output: any): string | undefined {
    // Transformers.js pipelines return slightly different shapes depending on task/version.
    if (!output) return undefined;
    if (typeof output === 'string') return output;
    if (Array.isArray(output)) {
      const first = output[0];
      if (typeof first === 'string') return first;
      if (first?.generated_text) return first.generated_text;
      if (first?.summary_text) return first.summary_text;
      if (first?.translation_text) return first.translation_text;
      if (first?.text) return first.text;
    }
    if (output?.generated_text) return output.generated_text;
    if (output?.text) return output.text;
    return undefined;
  }

  private async getLocalPipeline(modelId: string, modelBasePath: string, wasmBasePath: string): Promise<any> {
    if (!this.localPipelinePromise) {
      this.localPipelinePromise = (async () => {
        const transformers: any = await import('@huggingface/transformers');
        const env = transformers.env;

        // Fully offline: only load assets from the app bundle.
        env.allowRemoteModels = false;
        env.allowLocalModels = true;
        env.localModelPath = modelBasePath;
        env.useBrowserCache = true;

        // Ensure ONNX runtime WASM assets are loaded locally (copied into assets at build time).
        if (env.backends?.onnx?.wasm) {
          env.backends.onnx.wasm.wasmPaths = `${wasmBasePath}/`;
          // Mobile WebViews often don't support WASM threads; force single-thread for compatibility.
          env.backends.onnx.wasm.numThreads = 1;
        }

        // In browsers (including iOS/Android WebViews), Transformers.js uses 'wasm' or 'webgpu' devices.
        try {
          return transformers.pipeline('text2text-generation', modelId, { device: 'wasm', quantized: true });
        } catch {
          return transformers.pipeline('text2text-generation', modelId, { device: 'wasm' });
        }
      })();
    }

    return this.localPipelinePromise;
  }

  getAiUsageCount(): number {
    const dateKey = new Date().toISOString().slice(0, 10);
    const currentCount = Number(localStorage.getItem(`aiCalls_${dateKey}`) || '0');
    return currentCount;
  }

  private buildAiPrompt(query: SafetyQuery, selectedConditions: Condition[]): string {
    const listedConditions = selectedConditions.filter(condition => condition.id !== 'other');
    const listedNames = listedConditions.map(c => c.label).join(', ');
    const trimmedOther = query.otherText?.trim() ?? '';
    const otherText = trimmedOther ? `Other concern details: ${trimmedOther}.` : 'Other concern details were not provided.';
    const trimester = query.pregnancyTrimester ? `Pregnancy trimester: ${query.pregnancyTrimester}.` : '';
    const conditionSummary = [listedNames && `Conditions: ${listedNames}.`, trimester, trimmedOther ? otherText : '']
      .filter(Boolean)
      .join(' ');

    return `You are SafePilates Advisor, a cautious expert on Pilates safety for people with health concerns. Your role is ONLY to provide general educational guidance, not medical advice, diagnosis, or personalized prescriptions.

CRITICAL SAFETY RULES — NEVER BREAK THESE:
- ALWAYS begin the response with this exact bold disclaimer on its own line:
**⚠️ IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult your doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if you feel pain.**
- Do NOT diagnose conditions, prescribe specific rehabilitation exercises, or give individualized medical recommendations.
- If the selected concern is "Other," stay general, refer to symptoms or movement risks, and recommend professional clearance.
- Keep the response concise (under 350 words) with short headings and bullet points for mobile readability.
- If the issue is unclear, rare, or potentially serious, say so and urge the user to consult a qualified healthcare professional.

${conditionSummary || 'No listed conditions provided.'}

Provide a brief list of Pilates movement patterns or exercises to avoid or modify, a short reason for each, and a safer general alternative or focus area. Keep the answer educational, clear, and non-prescriptive.`;
  }

  private buildLocalAiPrompt(query: SafetyQuery, selectedConditions: Condition[]): string {
    // Keep this short: tiny on-device models are easily derailed by long “system” prompts.
    const listedConditions = selectedConditions.filter(condition => condition.id !== 'other');
    const listedNames = listedConditions.map(c => c.label).join(', ');
    const other = (query.otherText?.trim() || '').slice(0, 120);
    const trimester = query.pregnancyTrimester ? `Pregnancy trimester: ${query.pregnancyTrimester}.` : '';

    const input = [
      listedNames ? `Listed conditions: ${listedNames}.` : '',
      trimester,
      other ? `Other concern: ${other}.` : ''
    ]
      .filter(Boolean)
      .join(' ');

    return `You are writing general Pilates safety guidance (not medical advice).

First line MUST be:
IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult your doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if you feel pain.

Context: ${input || 'No details provided.'}

Now write the guidance with EXACTLY these headings and 2–4 bullet points each:

Avoid
- ...

Why
- ...

Safer focus
- ...

Rules:
- Stay general (no diagnosis, no rehab prescription).
- If the concern is unclear or serious, recommend professional clearance.`;
  }
}
