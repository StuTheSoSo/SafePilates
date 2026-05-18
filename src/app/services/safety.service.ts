import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Condition, Exercise, Contraindication, GuidanceResult, SafetyQuery, ConditionResult, Program } from '../models';
import { RevenueCatService, ENTITLEMENT_ID } from './revenueCat.service';
import safetyConditionsData from '../../assets/data/safety-conditions.json' with { type: 'json' };
import exercisesData from '../../assets/data/exercises.json' with { type: 'json' };
import contraindicationsData from '../../assets/data/contraindications.json' with { type: 'json' };
import programsData from '../../assets/data/programs.json' with { type: 'json' };

@Injectable({ providedIn: 'root' })
export class SafetyService {
  private http = inject(HttpClient);
  private revenueCatService = inject(RevenueCatService);
  private conditions: Condition[] = [];
  private exercises: Exercise[] = [];
  private contraindications: Record<string, Contraindication[]> = {};
  private programs: Program[] = [];
  private dataLoaded = false;
  private latestQuery: SafetyQuery | null = null;
  private latestGuidance: GuidanceResult | null = null;
  public librarySearchTerm = '';
  private readonly freeConditionIds = new Set<string>([
    // Musculoskeletal — core studio concerns
    'low_back_pain',
    'osteoporosis',
    'scoliosis',
    'disc_degeneration',
    'arthritis',
    'knee_issues',
    'hip_issues',           // consistent with hip_replacement
    'hip_replacement',
    'rotator_cuff_injury',
    'shoulder_instability', // consistent with rotator_cuff_injury
    'neck_shoulder',        // one of the most common studio complaints
    'plantar_fasciitis',
    'balance_issues',
    'vertigo_dizziness',
    // Pregnancy / women's health — always co-occur
    'pregnancy',
    'postpartum',
    'pelvic_floor_dysfunction', // almost always co-occurs with postpartum
    'diastasis_recti',          // almost always co-occurs with postpartum
    // Chronic / cardiovascular — basic safety awareness
    'hypertension',
    'cardiovascular_disease', // consistent with hypertension
    'diabetes',
    'respiratory',
    'chronic_fatigue',
    'weight_concerns',
    // Mental / cognitive — common in older clients
    'mental_cognitive'
  ]);

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

  isConditionPremium(conditionId: string): boolean {
    return !this.freeConditionIds.has(conditionId);
  }

  getFreeConditions(): Condition[] {
    return this.conditions.filter(condition => !this.isConditionPremium(condition.id));
  }

  /**
   * Returns true when the exercise belongs to the premium tier,
   * regardless of whether the user currently has premium access.
   * Callers that need to gate UI should combine: isExercisePremium(e) && !isPremiumActive().
   */
  isExercisePremium(exercise: Exercise | undefined): boolean {
    if (!exercise) {
      return false;
    }

    const category = (exercise.category || '').toLowerCase();
    const equipment = (exercise.equipment || '').toLowerCase();
    const apparatusSettings = (exercise.apparatusSettings || '').toLowerCase();
    const premiumTerms = ['reformer', 'cadillac', 'chair', 'barrel', 'tower', 'strap', 'spring', 'props', 'prop', 'carriage', 'apparatus'];

    return premiumTerms.some(term =>
      category.includes(term) ||
      equipment.includes(term) ||
      apparatusSettings.includes(term)
    );
  }

  isPremiumActive(): boolean {
    return this.revenueCatService.isEntitlementActive(ENTITLEMENT_ID);
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

  setErrorGuidance(_message: string) {
    this.latestGuidance = { conditionResults: [] };
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

    const selectedConditions = query.conditionIds
      .filter(id => !this.isConditionPremium(id) || this.isPremiumActive())
      .map((id: string) => this.conditions.find(item => item.id === id))
      .filter(Boolean) as Condition[];

    const conditionResults: ConditionResult[] = selectedConditions.map(condition => ({
      conditionId: condition.id,
      conditionLabel: condition.label,
      conditionDescription: condition.description,
      instructorNote: condition.instructorNote,
      pregnancyTrimester: condition.id === 'pregnancy' ? (query.pregnancyTrimester ?? 'Unknown') : undefined,
      contraindications: this.contraindications[condition.id] ?? []
    }));

    const result: GuidanceResult = {
      conditionResults,
      searchTerm: query.searchTerm?.trim() || undefined
    };

    this.latestGuidance = result;
    return result;
  }
}

