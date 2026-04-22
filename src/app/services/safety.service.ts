import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Condition, Exercise, Contraindication, GuidanceResult, SafetyQuery, ConditionResult, Program } from '../models';
import { environment } from '../../environments/environment';
import safetyConditionsData from '../../assets/data/safety-conditions.json' with { type: 'json' };
import exercisesData from '../../assets/data/exercises.json' with { type: 'json' };
import contraindicationsData from '../../assets/data/contraindications.json' with { type: 'json' };
import programsData from '../../assets/data/programs.json' with { type: 'json' };

type AiProvider = 'none' | 'local';

@Injectable({ providedIn: 'root' })
export class SafetyService {
  private http = inject(HttpClient);
  private conditions: Condition[] = [];
  private exercises: Exercise[] = [];
  private contraindications: Record<string, Contraindication[]> = {};
  private programs: Program[] = [];
  private dataLoaded = false;
  private latestQuery: SafetyQuery | null = null;
  private latestGuidance: GuidanceResult | null = null;
  public librarySearchTerm = '';

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

    this.programs = programsData as Program[];
    try {
      const programs = await firstValueFrom(this.http.get<Program[]>('/assets/data/programs.json'));
      if (programs?.length) {
        this.programs = programs;
      }
    } catch {
      // Keep bundled programs if asset loading fails.
    }

    this.dataLoaded = true;

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

  getExerciseContraindication(exerciseId: string, conditionId: string) {
    return (this.contraindications[conditionId] ?? []).find((item: Contraindication) => item.exerciseId === exerciseId);
  }

  getSelection(): SafetyQuery | null {
    return this.latestQuery;
  }

  getGuidance(): GuidanceResult | null {
    return this.latestGuidance;
  }

  getSelectedConditionResults(): ConditionResult[] {
    return this.latestGuidance?.conditionResults ?? [];
  }

  getExerciseGuidanceForSelectedConditions(exerciseId: string): Array<{ conditionId: string; conditionLabel: string; reason: string; alternative: string }> {
    return this.latestGuidance?.conditionResults?.flatMap((result: ConditionResult) =>
      result.contraindications
        .filter((item: Contraindication) => item.exerciseId === exerciseId)
        .map((item: Contraindication) => ({
          conditionId: result.conditionId,
          conditionLabel: result.conditionLabel,
          reason: item.reason,
          alternative: item.alternative
        }))
    ) ?? [];
  }

  getExerciseNote(exerciseId: string): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(`exercise_note_${exerciseId}`) || '';
  }

  setExerciseNote(exerciseId: string, note: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (note.trim()) {
      localStorage.setItem(`exercise_note_${exerciseId}`, note);
    } else {
      localStorage.removeItem(`exercise_note_${exerciseId}`);
    }
  }

  getProgramNote(programId: string): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(`program_note_${programId}`) || '';
  }

  setProgramNote(programId: string, note: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (note.trim()) {
      localStorage.setItem(`program_note_${programId}`, note);
    } else {
      localStorage.removeItem(`program_note_${programId}`);
    }
  }

  getConditionNote(conditionId: string): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }
    return localStorage.getItem(`condition_note_${conditionId}`) || '';
  }

  setConditionNote(conditionId: string, note: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (note.trim()) {
      localStorage.setItem(`condition_note_${conditionId}`, note);
    } else {
      localStorage.removeItem(`condition_note_${conditionId}`);
    }
  }

  setGuidance(guidance: GuidanceResult) {
    this.latestGuidance = guidance;
  }

  setErrorGuidance(message: string) {
    this.latestGuidance = {
      conditionResults: [],
      aiFallback: message,
      aiUsed: false
    };
  }

  getPrograms(): Program[] {
    return this.programs;
  }

  getProgramById(id: string): Program | undefined {
    return this.programs.find(program => program.id === id);
  }

  async fetchGuidance(query: SafetyQuery): Promise<GuidanceResult> {
    await this.initData();
    this.latestQuery = query;

    const selectedConditions = query.conditionIds.map((id: string) => this.conditions.find(item => item.id === id)).filter(Boolean) as Condition[];
    const otherText = query.otherText?.trim() ?? '';
    const inferredConditions = query.conditionIds.includes('other') && otherText ? this.inferConditionsFromOtherText(otherText) : [];
    const effectiveConditions = selectedConditions.filter(condition => condition.id !== 'other');
    const allConditions = inferredConditions.length > 0
      ? [...effectiveConditions, ...inferredConditions]
      : [...selectedConditions];
    const uniqueConditions = allConditions.filter(
      (condition, index, self) => self.findIndex(item => item.id === condition.id) === index
    );
    const conditionResults: ConditionResult[] = uniqueConditions.map(condition => ({
      conditionId: condition.id,
      conditionLabel: condition.label,
      conditionDescription: condition.description,
      instructorNote: condition.instructorNote,
      pregnancyTrimester: condition.id === 'pregnancy' ? (query.pregnancyTrimester ?? 'Unknown') : undefined,
      contraindications: this.contraindications[condition.id] ?? []
    }));

    const noLocalData = allConditions.some(condition => condition.id === 'other') || conditionResults.every(result => result.contraindications.length === 0);
    let aiFallback: string | undefined;
    const aiProvider = this.getAiProvider();
    const aiAvailable = this.isAiConfigured(aiProvider);
    const aiUsed = noLocalData && aiAvailable;

    console.log('SafetyService.fetchGuidance', {
      selectedConditions: selectedConditions.map(c => c.id),
      inferredConditions: inferredConditions.map(c => c.id),
      conditionResultsCount: conditionResults.length,
      noLocalData,
      aiProvider,
      aiAvailable,
      queryOther: otherText
    });

    if (noLocalData) {
      aiFallback = await this.getAiFallback(aiProvider, query, selectedConditions, aiAvailable);
      console.log('SafetyService.fetchGuidance AI fallback result', { aiFallback });
    }

    const result: GuidanceResult = {
      // When an AI/heuristic fallback covers the "other" text, drop the generic "other"
      // condition card so only the specific AI guidance card renders.
      conditionResults: aiFallback
        ? conditionResults.filter(r => r.conditionId !== 'other')
        : conditionResults,
      aiFallback,
      aiUsed,
      searchTerm: query.searchTerm?.trim() || undefined
    };

    this.latestGuidance = result;
    return result;
  }

  private getAiProvider(): AiProvider {
    if (this.isAndroidNoAi()) {
      return 'none';
    }

    const provider = (environment as { aiProvider?: string }).aiProvider?.trim().toLowerCase();
    if (provider === 'local' || provider === 'none') {
      return provider;
    }
    return 'none';
  }

  private isAndroidNoAi(): boolean {
    return Capacitor.getPlatform() === 'android';
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
      const otherText = (query.otherText || '').trim();
      if (otherText && this.shouldUseHeuristicForOther(otherText)) {
        localStorage.setItem(countKey, String(currentCount + 1));
        const fallbackText = this.buildHeuristicGuidance(query, selectedConditions);
        console.log('SafetyService.requestAiFallback using heuristic', { fallbackText });
        return fallbackText;
      }

      const promptText =
        provider === 'local'
          ? this.buildLocalAiPrompt(query, selectedConditions)
          : this.buildAiPrompt(query, selectedConditions);

      console.log('SafetyService.requestAiFallback prompt', { provider, promptText });

      const aiText =
        provider === 'local'
          ? await this.requestLocalOnDevice(promptText, query, selectedConditions)
          : 'AI fallback is disabled. Please consult a qualified professional for guidance.';

      console.log('SafetyService.requestAiFallback result', { aiText });

      localStorage.setItem(countKey, String(currentCount + 1));
      return aiText;
    } catch (error) {
      console.error('AI fallback error', error);
      return 'Unable to reach AI guidance at this time. Please consult a qualified professional for more details.';
    }
  }

  private shouldUseHeuristicForOther(otherText: string): boolean {
    return /\b(hamstring|strain|sprain|tear|injury|pain|rupture|tendon|ligament|muscle|sciatica|low back|lumbar|thoracic|spine|spinal|neck|shoulder|knee|hip|ankle|foot|arch|fallen arches|flat foot|plantar|heel|swollen|swelling|edema|joint|joint swelling|joint inflammation|pregnatal|postpartum|pelvic floor|pelvic|diastasis|pregnancy|asthma|breath|breathing|lung|wheeze|respiratory|shortness of breath|airway|bronch|cough|digestive|gastro|ibs|gerd|acid reflux|stomach|cancer|chemotherapy|radiation|lymph|lymphedema|swollen glands|swollen lymph nodes|lymphadenopathy|gland swelling|obese|obesity|overweight|overw[iy]ght|overwight|overwdight|weight(?:\s+(?:loss|gain|management))?|body mass|bmi|multiple sclerosis|ms\b|neuropathy|neurological|nerve|autoimmune|fibromyalgia|lupus|rheumatoid|chronic fatigue|migraines|demyelinating|neurogenic|balance|dizziness|vertigo|hypertension|blood pressure|heart|cardiovascular|cardio|chest pain|palpitations|arrhythmia|surgery|post[- ]surgery|replacement|arthriti|osteoporosis|arthritis|scoliosis|anxiety|depression|\bptsd\b|cognitive|dementia|brain fog|mental health|psychological|stress disorder|mood disorder|diabetes|thyroid|hypothyroid|hyperthyroid|\bmetabolic\b|endocrine|insulin|hormonal|adrenal|hashimoto|graves|fever|\bflu\b|infection|infectious|immune|immunocompromised|immunosuppressed|transplant)\b/i.test(otherText);
  }

  private inferConditionsFromOtherText(otherText: string): Condition[] {
    const lower = otherText.toLowerCase();
    const matches = new Set<string>();

    if (/(pregnanc|postpartum|post partum|pelvic floor|diastasis|maternity)/.test(lower)) {
      if (/postpartum|post partum/.test(lower)) {
        matches.add('postpartum');
      } else {
        matches.add('pregnancy');
      }
    }
    if (/(knee|hip|ankle|joint replacement|replacement|arthritis|osteoarthritis|rheumatoid|joint pain)/.test(lower)) {
      if (/replacement/.test(lower)) {
        matches.add('joint_replacement');
      }
      if (/knee/.test(lower)) {
        matches.add('knee_issues');
      }
      if (/hip/.test(lower)) {
        matches.add('hip_issues');
      }
      if (/ankle|foot|arch|fallen arches|flat foot|plantar|heel/.test(lower)) {
        matches.add('foot_ankle_issues');
      }
      if (/arthriti|arthritis/.test(lower)) {
        matches.add('arthritis');
      }
    }
    if (/(neck|shoulder|cervical|upper back|thoracic outlet|rotator cuff|shoulder impingement)/.test(lower)) {
      matches.add('neck_shoulder');
    }
    if (/(hypertension|blood pressure|heart|cardiovascular|cardio|chest pain|palpitations|arrhythmia|heart rate)/.test(lower)) {
      matches.add('hypertension');
    }
    if (/(scoli|spine|spinal|stenosis|spondyl|disc|herniated|kyphosis|lordosis)/.test(lower)) {
      matches.add('scoliosis');
    }
    if (/(bursitis|tendinopathy)/.test(lower)) {
      matches.add('bursitis');
    }
    if (/(asthma|breath|breathing|lung|wheeze|respiratory|shortness of breath|airway|bronch|cough)/.test(lower)) {
      matches.add('respiratory');
    }
    if (/(vertigo|dizziness|lightheaded|unsteady|wobbly)/.test(lower)) {
      matches.add('vertigo_dizziness');
    }
    if (/(diabetes|metabolic|blood sugar|insulin)/.test(lower)) {
      matches.add('diabetes');
    }
    if (/(fatigue|chronic fatigue|autoimmune|fibromyalgia|lupus|multiple sclerosis|ms|neuropathy|neurological|nerve|demyelinating|neurogenic)/.test(lower)) {
      matches.add('chronic_fatigue');
    }
    if (/(pregnancy|pelvic floor|diastasis|postpartum)/.test(lower)) {
      matches.add('pelvic_floor_dysfunction');
    }
    if (/(pregnancy|diastasis)/.test(lower)) {
      matches.add('diastasis_recti');
    }
    if (/(recent surgery|post[- ]surgery|recovery|reconstruction)/.test(lower)) {
      matches.add('recent_surgery');
    }
    if (/(obese|obesity|overweight|overw[iy]ght|overwight|overwdight|weight(?:\s+(?:loss|gain|management))?|body mass|bmi)/.test(lower)) {
      matches.add('weight_concerns');
    }
    if (/(foot|ankle|heel|plantar|arch|flat foot|fallen arches|metatarsal|posterior tibial|pes planus)/.test(lower)) {
      matches.add('foot_ankle_issues');
    }

    return Array.from(matches)
      .map(id => this.conditions.find(condition => condition.id === id))
      .filter(Boolean) as Condition[];
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
      'IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult the client’s doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if the client feels pain.\n\n';

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

    // Pregnancy / pelvic floor / postpartum pattern
    if (/(pregnancy|postpartum|post partum|pelvic floor|pelvic|diastasis|pregnan|maternity)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Heavy abdominal flexion or prolonged supine work after mid-pregnancy\n' +
        '- Deep rotations or unsupported backbends that compromise the abdomen\n' +
        '- Breath-holding, compression of the belly, or high-impact transitions\n\n' +
        'Why\n' +
        '- The body is adapting to a growing abdomen and pelvic floor changes\n' +
        '- Safe Pilates during pregnancy focuses on stability, breathing, and comfort\n\n' +
        'Safer focus\n' +
        '- Use side-lying, seated, or supported standing variations\n' +
        '- Keep the pelvis neutral and the breath steady\n' +
        '- Prioritize pelvic floor awareness, spinal support, and comfortable range of motion\n\n' +
        'If the client is pregnant, consult a qualified provider before continuing and stop if any movement feels unsafe.'
      );
    }

    // Balance / dizziness / vestibular concerns
    if (/(balance|dizziness|vertigo|lightheaded|unsteady|wobbly)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Rapid head turns, inversions, or unsupported balance challenges\n' +
        '- Sudden changes of position from lying to standing\n' +
        '- Exercises that require precise single-leg balance without support\n\n' +
        'Why\n' +
        '- Vestibular symptoms are often aggravated by motion and unstable surfaces\n' +
        '- Sudden shifts can worsen dizziness and increase fall risk\n\n' +
        'Safer focus\n' +
        '- Stay grounded with both feet on the mat and move slowly\n' +
        '- Use supports like a chair or wall for balance as needed\n' +
        '- Focus on gentle breath and core support rather than challenging equilibrium\n\n' +
        'If dizziness is new, severe, or accompanied by other symptoms, seek medical advice before exercising.'
      );
    }

    // Respiratory / asthma / breath concerns
    if (/(asthma|breath|breathing|lung|wheeze|respiratory|shortness of breath|airway|bronch|cough)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Breathing & Respiratory Support\n\n' +
        'Avoid\n' +
        '- High-intensity breath-holding movements or rapid exertion\n' +
        '- Inversions or positions that compress the chest and ribs\n' +
        '- Fast transitions without first checking that breathing feels calm\n\n' +
        'Why\n' +
        '- Respiratory concerns respond better to gentle, controlled movement and steady breath\n' +
        '- Heavy or abrupt exertion can trigger wheezing, shortness of breath, or chest tightness\n\n' +
        'Safer focus\n' +
        '- Choose low-impact Pilates with smooth inhalation/exhalation patterns\n' +
        '- Keep the chest open, the ribs soft, and avoid compressive upper-body positions\n' +
        '- Pause, rest, and normalize breathing whenever the effort increases\n\n' +
        'If breathing becomes difficult, wheezy, or tight, stop and seek medical guidance before continuing.'
      );
    }

    // Weight or obesity concerns
    if (/(obese|obesity|overweight|overw[iy]ght|overwight|overwdight|weight(?:\s+(?:loss|gain|management))?|body mass|bmi)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Weight & Joint-Friendly Pilates\n\n' +
        'Avoid\n' +
        '- High-impact or fast-transition exercises that stress the knees, hips, and lower back\n' +
        '- Deep loaded stepping, fast balance challenges, or heavy inversion work\n' +
        '- Extended time in positions that compress the joints without adequate support\n\n' +
        'Why\n' +
        '- Extra body weight can increase joint pressure and fatigue during high-load Pilates movements\n' +
        '- Slower, controlled movement and better support protect the hips, knees, and spine\n\n' +
        'Safer focus\n' +
        '- Choose low-impact, supported Pilates with smooth transitions and stable base contact\n' +
        '- Keep the breath steady, maintain good alignment, and avoid rushing through the sequence\n' +
        '- Favor exercises that emphasize core support and joint-friendly mobility rather than maximal range\n\n' +
        'If weight-related joint discomfort or fatigue increases, stop and consult a qualified instructor or clinician before continuing.'
      );
    }

    // Digestive / gastrointestinal concerns
    if (/(digestive|gastro|ibs|gerd|acid reflux|heartburn|stomach|intestinal|colitis|crohn|bloating|nausea)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Digestive & Core Support\n\n' +
        'Avoid\n' +
        '- Deep abdominal compression, strong twists, or aggressive forward folds that feel uncomfortable\n' +
        '- Breath-holding or forceful abdominal bracing\n' +
        '- Rapid transitions that exacerbate nausea or bloating\n\n' +
        'Why\n' +
        '- Gastrointestinal symptoms often improve with gentle core support and calm, steady movement\n' +
        '- Excessive compression or rotation can increase discomfort and pressure in the abdomen\n\n' +
        'Safer focus\n' +
        '- Keep the breath soft and the core gently engaged without squeezing the belly\n' +
        '- Favor supported, neutral-spine positions and avoid intense abdominal strain\n' +
        '- Move slowly and stop if any exercise increases digestive discomfort\n\n' +
        'If digestive symptoms worsen, consult a qualified provider before continuing.'
      );
    }

    // Cancer / oncology / lymphedema concerns
    if (/(cancer|chemotherapy|radiation|oncology|mastectomy|lumpectomy|lymph|lymphedema|tumor|malignancy|metastasis)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Oncology & Recovery Support\n\n' +
        'Avoid\n' +
        '- High-impact, high-intensity, or unsupported movements without clearance\n' +
        '- Heavy loading through surgical sites or areas affected by treatment\n' +
        '- Forced range of motion in areas with recent surgery, radiation, or swelling\n\n' +
        'Why\n' +
        '- Cancer treatment and recovery often require very gradual progress, careful load management, and support around vulnerable tissues\n' +
        '- Prioritizing comfort and professional clearance helps prevent irritation and swelling\n\n' +
        'Safer focus\n' +
        '- Choose gentle, supported Pilates with an emphasis on breath, posture, and relaxed movement\n' +
        '- Avoid pushing through fatigue, pain, or localized discomfort\n' +
        '- Keep the body hydrated and stop if any area feels overly strained or swollen\n\n' +
        'Always check with your oncology care team or rehabilitation specialist before continuing.'
      );
    }

    // Swollen joints / joint inflammation concerns
    if (/(swollen|swelling|edema|joint swelling|joint inflammation)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Joint swelling & inflammation support\n\n' +
        'Avoid\n' +
        '- Deep compression or heavy loading of the affected joint(s)\n' +
        '- Repetitive end-range movements that increase swelling or discomfort\n' +
        '- Prolonged unsupported weight-bearing on sensitive joints\n\n' +
        'Why\n' +
        '- Swollen joints often indicate inflammation, irritation, or fluid buildup around the joint structures\n' +
        '- Protected movement and joint support help reduce pain and prevent worsening symptoms\n\n' +
        'Safer focus\n' +
        '- Use gentle, supported movement with a comfortable range of motion\n' +
        '- Keep joints aligned, avoid compression, and favor stability over depth\n' +
        '- Pause frequently and stop if swelling or pain increases\n\n' +
        'If the swelling is new, severe, or accompanied by redness, heat, or sharp pain, consult a qualified clinician before continuing.'
      );
    }

    // Foot / arch / fallen arches concerns
    if (/(fallen arches|flat foot|flat feet|arch|plantar|heel|foot pain|metatarsal|posterior tibial|pes planus)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Foot & Arch Support\n\n' +
        'Avoid\n' +
        '- Unsupported standing balance and high-impact foot loading\n' +
        '- Deep ankle squats or exercises that force excessive pronation\n' +
        '- Long unsupported spans on the forefoot or toes\n\n' +
        'Why\n' +
        '- Arch support and foot alignment are essential for protecting the plantar system\n' +
        '- Unsupported foot collapse can increase strain through the ankle, knee, and low back\n\n' +
        'Safer focus\n' +
        '- Use a stable base, maintain neutral foot alignment, and keep weight evenly distributed\n' +
        '- Favor low-impact foot positions with gentle sole contact and support under the arch\n' +
        '- Build intrinsic foot strength and ankle stability before progressing to challenging balance work\n\n' +
        'If foot pain persists, worsens, or is accompanied by swelling, get clearance from a qualified provider before continuing.'
      );
    }

    // Back / spine / low back concerns
    if (/(low back|back pain|spine|spinal|scoliosis|stenosis|spondyl|disc|disc herniation|herniated disc|lumbar|thoracic|kyphosis|lordosis)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Repetitive end-range flexion, extension, or twisting of the spine\n' +
        '- Quick load changes that destabilize the lumbar spine\n' +
        '- Unsupported bridge or inversion work if it increases discomfort\n\n' +
        'Why\n' +
        '- The spine is sensitive to repeated compression, rotation, and shear\n' +
        '- Controlled movement and neutral alignment reduce irritation\n\n' +
        'Safer focus\n' +
        '- Prioritize neutral spine stabilization and gentle articulation\n' +
        '- Use core support with small meaningful spinal movements\n' +
        '- Avoid explosive or extended-range exercises when the back feels symptomatic\n\n' +
        'If pain is sharp, radiating, or accompanied by numbness, consult a clinician before continuing.'
      );
    }

    // Hip / knee / lower joint concerns
    if (/(knee|hip|ankle|joint replacement|replacement|arthritis|osteoarthritis|rheumatoid|joint pain)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Deep loaded knee bends, high torque hip rotations, or aggressive joint compression\n' +
        '- Rapid leg cycling or repeated impact if it causes pain\n' +
        '- Unsupported single-leg balance work when the joint is sensitive\n\n' +
        'Why\n' +
        '- Joint issues benefit from controlled range and stable alignment\n' +
        '- Painful or unstable joints should not be overloaded with forceful movements\n\n' +
        'Safer focus\n' +
        '- Keep the limb in a pain-free range and focus on muscle support around the joint\n' +
        '- Use support, lighter resistance, and slower movement quality\n' +
        '- Emphasize alignment and fluid motion over depth or speed\n\n' +
        'If the joint feels unstable, swollen, or overly painful, stop and seek professional guidance.'
      );
    }

    // Obesity / weight-related concerns
    if (/(obese|obesity|overweight|weight(?:\s+(?:loss|gain|management))?|body mass|bmi)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- High-impact jumps, running, or unsupported loading that may stress joints\n' +
        '- Deep, forceful leg and hip positions that feel uncomfortable\n' +
        '- Breath-holding or pushing through fatigue\n\n' +
        'Why\n' +
        '- Extra joint load and movement patterns can increase strain on knees, hips, and lower back\n' +
        '- Slow, controlled Pilates supports posture and helps build strength without excessive impact\n' +
        '- Comfortable breathing and gradual progress are especially important when weight or metabolic concerns are present\n\n' +
        'Safer focus\n' +
        '- Use supported, low-impact variations and keep the movements smooth and controlled\n' +
        '- Build core stability, pelvic alignment, and hip strength before adding load\n' +
        '- Prioritize breath, posture, and pain-free motion over repetitions or intensity\n\n' +
        'If the client has joint pain, metabolic concerns, or questions about safe exercise progressions, consult a qualified provider before continuing.'
      );
    }

    // Neck / shoulder concerns
    if (/(neck|shoulder|cervical|upper back|thoracic outlet|rotator cuff|shoulder impingement)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Unsupported head lifts, heavy shoulder load, or exercises that round the upper back\n' +
        '- High-reaching overhead work and forceful arm presses if shoulder comfort is limited\n' +
        '- Rapid neck rotation or extension when the cervical spine feels tight\n\n' +
        'Why\n' +
        '- The neck and shoulders require support and ease of motion to avoid strain\n' +
        '- Poor upper-body alignment can increase tension in the neck and shoulder girdle\n\n' +
        'Safer focus\n' +
        '- Keep the head supported and the shoulder blades stable\n' +
        '- Use gentle scapular control and small arm movements\n' +
        '- Prioritize quality of posture over range of motion\n\n' +
        'If pain or numbness persists with neck or shoulder movement, consult a qualified provider first.'
      );
    }

    // Cardiovascular / hypertension concerns
    if (/(hypertension|blood pressure|heart|cardiovascular|cardio|chest pain|palpitations|arrhythmia|heart rate)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Inversions, breath-holding, or sudden high-intensity efforts\n' +
        '- Heavy load and rapid transitions that spike heart rate\n' +
        '- Holding the breath during exertion or straining strongly\n\n' +
        'Why\n' +
        '- Cardiovascular concerns are best managed with calm, steady movement and safe breath patterns\n' +
        '- Rapid or high-pressure activity can raise blood pressure and stress the heart\n\n' +
        'Safer focus\n' +
        '- Keep movement smooth, controlled, and comfortable\n' +
        '- Breathe steadily and avoid breath-holding\n' +
        '- Use lower intensity, longer rest periods, and a slower pace\n\n' +
        'If there is chest pain, dizziness, or palpitations, stop immediately and seek medical attention.'
      );
    }

    // Post-surgical or recent surgery concerns
    if (/(post[- ]surgery|recent surgery|surgery|replacement|recovery|reconstruction)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Aggressive movement, heavy loading, or deep joint/alignment stress during recovery\n' +
        '- Twisting, abrupt transitions, or unsupported positions that may strain healing tissue\n' +
        '- High-impact or high-resistance work before clearance\n\n' +
        'Why\n' +
        '- Healing tissues need gradual, protected movement with controlled loading\n' +
        '- Premature intensity can delay recovery or irritate surgical sites\n\n' +
        'Safer focus\n' +
        '- Keep motion gentle, supported, and within comfort\n' +
        '- Prioritize controlled alignment and slow progressions\n' +
        '- Follow the client’s clinician’s guidance and stop if anything feels too intense\n\n' +
        'Always check with your surgeon or rehabilitation specialist before resuming Pilates after surgery.'
      );
    }

    // Neurological / autoimmune / chronic condition pattern
    if (/(multiple sclerosis|\bms\b|neuropathy|neurological|nerve|autoimmune|fibromyalgia|lupus|rheumatoid|chronic fatigue|migraines|demyelinating|neurogenic)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Avoid\n' +
        '- Sustained high-intensity efforts that increase fatigue or overheating\n' +
        '- Rapid balance challenges or unsupported inversions if dizziness is present\n' +
        '- Heavy loaded movement without a stable core and joint support\n\n' +
        'Why\n' +
        '- Neurological and autoimmune conditions often respond better to steady, low-impact movement than to high load or rapid change\n' +
        '- Fatigue, heat, and balance disruption can make symptoms worse even without pain\n\n' +
        'Safer focus\n' +
        '- Choose gentle, supported Pilates patterns with emphasis on control, breath, and joint alignment\n' +
        '- Prioritize frequent rest, hydration, and movement in a comfortable range\n' +
        '- Work with slow transitions and avoid sudden head or torso rotations if balance is affected\n\n' +
        'If symptoms change suddenly, increase significantly, or include new numbness, visual changes, or loss of coordination, seek professional advice before continuing.'
      );
    }

    // Metabolic / endocrine concerns
    if (/(diabetes|thyroid|hypothyroid|hyperthyroid|\bmetabolic\b|endocrine|insulin|hormonal|adrenal|hashimoto|graves|hormone(?:\s+(?:imbalance|therapy|replacement))?)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Metabolic & Endocrine Support\n\n' +
        'Avoid\n' +
        '- Sudden high-intensity efforts or long sessions without adequate rest and hydration\n' +
        '- Breath-holding, extreme temperature exposure, or rapid energy demands\n' +
        '- Pushing through fatigue, dizziness, or signs of blood sugar instability\n\n' +
        'Why\n' +
        '- Metabolic and endocrine conditions can affect energy levels, temperature regulation, and recovery\n' +
        '- Careful pacing and monitoring help keep exercise safe and sustainable\n\n' +
        'Safer focus\n' +
        '- Choose steady, moderate-intensity Pilates with frequent rest breaks\n' +
        '- Keep movement controlled and avoid prolonged high-effort sequences\n' +
        '- Prioritize hydration, temperature comfort, and energy management throughout the session\n\n' +
        'If the client has diabetes, check blood glucose before and after exercise. Consult a qualified clinician before continuing if symptoms are unstable or new.'
      );
    }

    // Immune / infectious concerns
    if (/(fever|\bflu\b|infection|infectious|\bimmune\b|immunocompromised|immunosuppressed|transplant)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Immune & Infectious Condition Support\n\n' +
        'Avoid\n' +
        '- Exercising through active fever, systemic illness, or infectious symptoms\n' +
        '- High-intensity or prolonged sessions that further stress a compromised immune system\n' +
        '- Group environments if there is any risk of spreading infection\n\n' +
        'Why\n' +
        '- The body uses energy resources to fight infection; exercise during acute illness can worsen symptoms and prolong recovery\n' +
        '- Immunocompromised clients need additional caution around load, hygiene, and environment\n\n' +
        'Safer focus\n' +
        '- If currently unwell: rest is usually preferable; gentle movement only if cleared by a clinician\n' +
        '- During recovery: restart with low-intensity, short sessions and progress gradually\n' +
        '- Prioritize hygiene, ventilation, and keeping sessions light until fully recovered\n\n' +
        'If symptoms include fever, shortness of breath, or chest pain, stop and seek medical advice before exercising.'
      );
    }

    // Mental health / cognitive concerns
    if (/(anxiety|depression|\bptsd\b|cognitive|dementia|brain\s*fog|mental health|psychological|stress disorder|mood disorder)/.test(otherLower)) {
      return (
        disclaimer +
        contextLine +
        'Mental Health & Cognitive Support\n\n' +
        'Avoid\n' +
        '- Overly complex, fast-paced routines that increase confusion or anxiety\n' +
        '- Pushing through emotional or physical distress without pausing\n' +
        '- High-pressure environments, unpredictable transitions, or unfamiliar settings without adequate orientation\n\n' +
        'Why\n' +
        '- Mental health and cognitive conditions can affect concentration, emotional regulation, and body awareness\n' +
        '- A calm, structured environment supports focus and reduces risk of overwhelm\n\n' +
        'Safer focus\n' +
        '- Keep routines predictable, cues simple and clear, and transitions slow\n' +
        '- Use grounding movements: breath, gentle body awareness, and steady rhythmic exercise\n' +
        '- Allow extra time between exercises and check in frequently on how the client is feeling\n\n' +
        'If the client is in acute distress, on new medication, or has concerns about exercising, consult a qualified mental health provider or clinician before continuing.'
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
`- Keep everything in a comfortable range while clarifying ${shortOther}\n` +
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

    // Reject generic, boilerplate model outputs that do not follow the expected guidance structure.
    const hasAvoid = /\bAVOID\b/.test(upper);
    const hasWhy = /\bWHY\b/.test(upper);
    const hasSaferFocus = /\bSAFER\s+FOCUS\b/.test(upper);
    if (!(hasAvoid && hasWhy && hasSaferFocus)) {
      return true;
    }

    // Reject known bland fallback phrasing from weak local models.
    if (upper.includes('THE FOLLOWING RULES ARE FOR') || upper.includes('GENERALLY SPEAKING') || upper.includes('THE CORRECT POSITION MUST BE AVOIDED')) {
      return true;
    }

    // Detect extreme repetition (common failure mode in tiny on-device models).
    const words = upper.replace(/[^A-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
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
        const transformersUrl = `${window.location.origin}/assets/transformers/transformers.js`;
        const importedModule: any = await import(/* webpackIgnore: true */ transformersUrl);
        const transformers: any = importedModule.default ?? importedModule;
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
    const inferredHint = trimmedOther ? this.getLikelyOtherConditionText(trimmedOther) : undefined;
    const conditionSummary = [listedNames && `Conditions: ${listedNames}.`, trimester, trimmedOther ? otherText : '', inferredHint]
      .filter(Boolean)
      .join(' ');

    return `You are PilateSafe Advisor, a cautious expert on Pilates safety for people with health concerns. Your role is ONLY to provide general educational guidance, not medical advice, diagnosis, or personalized prescriptions.

CRITICAL SAFETY RULES — NEVER BREAK THESE:
- ALWAYS begin the response with this exact bold disclaimer on its own line:
**⚠️ IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult the client’s doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if the client feels pain.**
- Do NOT diagnose conditions, prescribe specific rehabilitation exercises, or give individualized medical recommendations.
- Treat any unlisted or "Other" concern as a symptom-based general guidance request.
- Use the user’s text to infer the likely system or movement risk (for example respiratory, digestive, neurological, joint, pelvic, or cardiovascular) and shape guidance around safe Pilates practice.
- If the concern mentions swelling, joint irritation, edema, or inflammation, frame it as a joint-support and protection issue.
- If the concern is unclear, vague, or may be serious, keep recommendations conservative and urge professional clearance.
- Keep the response concise (under 350 words) with short headings and bullet points for mobile readability.

${conditionSummary || 'No listed conditions provided.'}

Provide guidance in these three sections exactly, using the headings shown below and bullet points where appropriate:

What is it?
- A brief description of the concern or how it affects Pilates practice.

What are the dangers?
- A concise summary of the movement risks or why the condition matters.

Exercises to be avoided
- List Pilates movement patterns or exercises to avoid or modify, with a short reason and a safer alternative or focus area for each.

Keep the answer educational, clear, and non-prescriptive.`;
  }

  private buildLocalAiPrompt(query: SafetyQuery, selectedConditions: Condition[]): string {
    // Keep this short: tiny on-device models are easily derailed by long “system” prompts.
    const listedConditions = selectedConditions.filter(condition => condition.id !== 'other');
    const listedNames = listedConditions.map(c => c.label).join(', ');
    const other = (query.otherText?.trim() || '').slice(0, 180);
    const trimester = query.pregnancyTrimester ? `Pregnancy trimester: ${query.pregnancyTrimester}.` : '';

    const input = [
      listedNames ? `Listed conditions: ${listedNames}.` : '',
      trimester,
      other ? `Other concern: ${other}.` : ''
    ]
      .filter(Boolean)
      .join(' ');

    const inferredHint = other ? this.getLikelyOtherConditionText(other) : undefined;
    return `You are writing general Pilates safety guidance (not medical advice).

First line MUST be:
IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult the client’s doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if the client feels pain.

Context: ${input || 'No details provided.'}
${inferredHint ? `Likely concern type: ${inferredHint}` : ''}

If this is an unlisted concern, use the text to infer the general system or movement risk and keep the advice conservative.
If the text mentions swelling, inflammation, or joint irritation, emphasize joint protection and avoiding compression or painful range.

Now write the guidance with EXACTLY these headings and 2–4 bullet points each:

What is it?
- ...

What are the dangers?
- ...

Exercises to be avoided
- ...

Rules:
- Stay general (no diagnosis, no rehab prescription).
- If the concern is unclear or serious, recommend professional clearance.`;
  }

  private getLikelyOtherConditionText(otherText: string): string | undefined {
    const inferred = this.inferConditionsFromOtherText(otherText || '');
    if (!inferred.length) {
      return undefined;
    }
    return inferred.map(condition => condition.label).join(', ');
  }
}
