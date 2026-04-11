import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Condition, Exercise, Contraindication, GuidanceResult, SafetyQuery, ConditionResult } from '../models';
import { environment } from '../../environments/environment';
import safetyConditionsData from '../../assets/data/safety-conditions.json' with { type: 'json' };
import exercisesData from '../../assets/data/exercises.json' with { type: 'json' };
import contraindicationsData from '../../assets/data/contraindications.json' with { type: 'json' };

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
    const aiAvailable = Boolean(environment.geminiApiKey?.trim());
    const aiUsed = noLocalData && aiAvailable;

    if (noLocalData) {
      aiFallback = await this.getAiFallback(query, selectedConditions, aiAvailable);
    }

    const result: GuidanceResult = {
      conditionResults,
      aiFallback,
      aiUsed
    };

    this.latestGuidance = result;
    return result;
  }

  private async getAiFallback(query: SafetyQuery, selectedConditions: Condition[], aiAvailable: boolean): Promise<string> {
    if (!aiAvailable) {
      return 'AI fallback is not configured in this build. Please consult a qualified professional for guidance or choose a listed condition for local safety guidance.';
    }

    return this.withTimeout(
      this.requestAiFallback(query, selectedConditions),
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

  async requestAiFallback(query: SafetyQuery, selectedConditions: Condition[]): Promise<string> {
    const dateKey = new Date().toISOString().slice(0, 10);
    const countKey = `aiCalls_${dateKey}`;
    const currentCount = Number(localStorage.getItem(countKey) || '0');
    if (currentCount >= 5) {
      return 'AI guidance limit reached for today. Please rely on the local safety guidance and consult a professional.';
    }

    try {
      const promptText = this.buildAiPrompt(query, selectedConditions);
      const sdk = await import('@google/generative-ai');
      const client = new sdk.GoogleGenerativeAI(environment.geminiApiKey);
      const model = client.getGenerativeModel({ model: 'models/text-bison-001' });
      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }]
          }
        ]
      });
      const aiText = response.response?.text?.() ?? 'No response received from AI.';

      localStorage.setItem(countKey, String(currentCount + 1));
      return aiText;
    } catch (error) {
      console.error('AI fallback error', error);
      return 'Unable to reach AI guidance at this time. Please consult a qualified professional for more details.';
    }
  }

  getAiUsageCount(): number {
    const dateKey = new Date().toISOString().slice(0, 10);
    const currentCount = Number(localStorage.getItem(`aiCalls_${dateKey}`) || '0');
    return currentCount;
  }

  private buildAiPrompt(query: SafetyQuery, selectedConditions: Condition[]): string {
    const conditionNames = selectedConditions.map(c => c.label).join(', ') || 'no listed condition';
    const otherText = query.otherText ? ` Condition details: ${query.otherText}` : '';
    const trimester = query.pregnancyTrimester ? ` Trimester: ${query.pregnancyTrimester}.` : '';

    return `You are SafePilates Advisor, a cautious expert on Pilates safety for people with health concerns. Your role is ONLY to provide general educational guidance on classical mat Pilates exercises that should be avoided or modified for specific conditions.

CRITICAL SAFETY RULES — NEVER BREAK THESE:
- ALWAYS begin your response with this exact bold disclaimer on its own line:  
**⚠️ IMPORTANT: This is general educational information only and is NOT a substitute for professional medical advice. Consult your doctor or a qualified physical therapist before starting, modifying, or continuing any Pilates practice, especially with health conditions. Stop immediately if you feel pain.**
- Never diagnose, prescribe exercises, or give personalized medical advice.
- If the condition is acute, undiagnosed, post-surgical, or severe, strongly recommend professional medical clearance first and provide only very general guidance.
- Base all advice on established guidelines (e.g., Royal Osteoporosis Society for bone density, ACOG for pregnancy, physical therapy consensus for back pain).
- Focus on what the user CAN safely do while being clear about risks.
- Keep the entire response concise (under 400 words total). Use short bullet points and clear headings for mobile readability.
- If unsure about a rare condition, say so and recommend consulting a professional rather than guessing.

Selected conditions: ${conditionNames}.${trimester}${otherText}

Provide a concise table or bullet list of exercises to avoid or modify, a brief reason, and safer alternatives. Keep the advice educational and general.`;
  }
}
