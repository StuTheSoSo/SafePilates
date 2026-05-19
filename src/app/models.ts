export interface Condition {
  id: string;
  label: string;
  description: string;
  instructorNote?: string;
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
  whatToAvoid?: string;
  alternativeExercise?: string;
  modificationsAndAlternatives?: string[];
  referenceDetails?: string;
  instructionsAndDetails?: string;
  instructorNote?: string;
  selfCheck?: string;
  teachingCues?: string[];
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
  instructorNote?: string;
  pregnancyTrimester?: string;
  contraindications: Contraindication[];
  isPremium?: boolean;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All' | string;
  goal: string;
  focusAreas: string[];
  exerciseIds: string[];
  accessLevel?: 'Free' | 'Pro';
  exerciseRoles?: Record<string, 'Warm-up' | 'Core activation' | 'Integration' | 'Cool-down'>;
  conditionModifications?: Record<string, string>;
}

export interface SafetyQuery {
  conditionIds: string[];
  pregnancyTrimester?: string;
  searchTerm?: string;
}

export interface GuidanceResult {
  conditionResults: ConditionResult[];
  searchTerm?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  conditionIds: string[];
  pregnancyTrimester?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
