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
  movementProfile?: ExerciseMovementProfile;
}

export type SpinalAction = 'flexion' | 'extension' | 'rotation' | 'lateral-flexion' | 'neutral';
export interface ExerciseMovementProfile {
  spinalActions?: SpinalAction[];
  centered?: boolean;
  expansion?: boolean;
  breath?: boolean;
  bodyPosition?: 'supine' | 'prone' | 'seated' | 'kneeling' | 'standing' | 'side-lying' | string;
  complexity?: 1 | 2 | 3 | 4 | 5;
  flowRoles?: FlowRole[];
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

export interface PilatesDataBundle {
  exercises: Exercise[];
  conditions: Condition[];
  contraindications: Record<string, Contraindication[]>;
  programs: Program[];
}

export type FlowGradeStatus = 'strong' | 'developing' | 'needs-attention';
export interface FlowGradeCategory {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: FlowGradeStatus;
  summary: string;
}
export interface FlowShortcoming {
  id: string;
  severity: 'info' | 'attention';
  title: string;
  description: string;
  suggestion: string;
  segmentIds: string[];
  exerciseIds: string[];
}
export interface FlowGradeReport {
  overallScore: number;
  status: FlowGradeStatus;
  categories: FlowGradeCategory[];
  strengths: string[];
  shortcomings: FlowShortcoming[];
}

export type FlowRole = 'preparation' | 'main' | 'closing';

export interface FlowItem {
  id: string;
  exerciseId: string;
  durationMinutes: number;
  notes: string;
  apparatus: string;
}

export interface FlowSegment {
  id: string;
  name: string;
  intent: string;
  durationTargetMinutes: number;
  items: FlowItem[];
}

export interface FlowPlan {
  id: string;
  name: string;
  clientId?: string;
  clientName: string;
  goal: string;
  selectedConditionIds: string[];
  segments: FlowSegment[];
  savedAt?: string;
}

export interface RunnerSettings {
  autoAdvanceOnExerciseEnd: boolean;
  exerciseEndSound: boolean;
  exerciseEndHaptics: boolean;
}

export interface RunExercise {
  id: string;
  exerciseId: string;
  segmentId: string;
  segmentName: string;
  durationSeconds: number;
  notes: string;
  apparatus: string;
}

export type ClassRunSource = 'planner' | 'template';
export type RunnerStatus = 'ready' | 'setup' | 'running' | 'paused' | 'completed';

export interface ClassRunState {
  source: ClassRunSource;
  plan: FlowPlan;
  exercises: RunExercise[];
  currentIndex: number;
  currentExerciseElapsedSeconds: number;
  elapsedSeconds: number;
  status: RunnerStatus;
  completedExerciseId?: string;
}
