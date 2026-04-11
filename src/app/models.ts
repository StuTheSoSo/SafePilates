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
  contraindications: Contraindication[];
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
