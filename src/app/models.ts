export interface Condition {
  id: string;
  label: string;
  description: string;
  hasTrimester?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  shortDescription: string;
  focus: string;
  benefits?: string;
  category: string;
  equipment?: string;
  setup?: string;
  breathing?: string;
  keyTakeaway?: string;
  safetyNote?: string;
  instructions?: Array<string | string[]>;
  commonMistakes?: string[];
  reps?: string;
  repRanges?: {
    beginner?: string;
    intermediate?: string;
    advanced?: string;
    notes?: string;
  };
  primaryMuscles?: string[];
  whereToFeel?: string;
  transitionIn?: string;
  transitionOut?: string;
  apparatusSettings?: string;
  contraindicationsNote?: string;
  selfCheck?: string;
  videoUrl?: string;
  breathPatternVisual?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  modifications?: string[];
  progressions?: string[];
}

export interface Contraindication {
  exerciseId: string;
  reason: string;
  alternative: string;
}

export interface ConditionResult {
  conditionId: string;
  conditionLabel: string;
  conditionDescription: string;
  pregnancyTrimester?: string;
  contraindications: Contraindication[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All' | string;
  goal: string;
  focusAreas: string[];
  exerciseIds: string[];
}

export interface SafetyQuery {
  conditionIds: string[];
  pregnancyTrimester?: string;
  otherText?: string;
}

export interface GuidanceResult {
  conditionResults: ConditionResult[];
  aiFallback?: string;
  aiUsed: boolean;
}
