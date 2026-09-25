import { Injectable } from '@angular/core';
import { Exercise, FlowGradeCategory, FlowGradeReport, FlowItem, FlowPlan, FlowSegment, FlowShortcoming, PilatesDataBundle, SpinalAction } from '../models';

interface GradedItem { item: FlowItem; segment: FlowSegment; exercise?: Exercise; actions: SpinalAction[]; centered: boolean; expansion: boolean; breath: boolean; complexity: number; }

@Injectable({ providedIn: 'root' })
export class FlowGradingService {
  gradeFlow(plan: FlowPlan, bundle: PilatesDataBundle): FlowGradeReport {
    const items = this.getGradedItems(plan, bundle);
    if (!items.length) return this.emptyFlowReport();
    const categories = [this.gradeStructure(plan, items), this.gradeBalance(items), this.gradeProgression(items), this.gradePrinciples(items), this.gradeTransitions(items)];
    const shortcomings = this.findShortcomings(plan, items);
    const total = categories.reduce((sum, category) => sum + category.score, 0);
    const maxTotal = categories.reduce((sum, category) => sum + category.maxScore, 0);
    const overallScore = Math.round((total / maxTotal) * 100);
    return { overallScore, status: this.getStatus(overallScore), categories, strengths: this.findStrengths(categories, items), shortcomings };
  }

  private emptyFlowReport(): FlowGradeReport {
    return { overallScore: 0, status: 'needs-attention', categories: [
      this.category('structure', 'Structure and purpose', 0, 20, 'Add exercises before grading the class arc.'),
      this.category('balance', 'Movement balance', 0, 20, 'Add exercises before assessing movement variety.'),
      this.category('progression', 'Progression', 0, 15, 'Add exercises before assessing challenge progression.'),
      this.category('principles', 'Breath, centering, and expansion', 0, 20, 'Add exercises before assessing Pilates principles.'),
      this.category('transitions', 'Control and flow', 0, 10, 'Add exercises before assessing transitions.'),
    ], strengths: [], shortcomings: [this.issue('empty', 'The flow is empty', 'There are no exercises to assess yet.', 'Add preparation, main-work, and closing exercises.', [], [])] };
  }

  private getGradedItems(plan: FlowPlan, bundle: PilatesDataBundle): GradedItem[] {
    return plan.segments.flatMap(segment => segment.items.map(item => {
      const exercise = bundle.exercises.find(candidate => candidate.id === item.exerciseId);
      const profile = exercise?.movementProfile;
      const text = this.exerciseText(exercise);
      return { item, segment, exercise, actions: profile?.spinalActions?.length ? profile.spinalActions : this.inferActions(text), centered: profile?.centered ?? this.hasAny(text, ['abdominal', 'core', 'pelvis', 'ribcage', 'center']), expansion: profile?.expansion ?? this.hasAny(text, ['length', 'lengthen', 'open', 'stretch', 'expand', 'long spine']), breath: profile?.breath ?? Boolean(exercise?.breathing), complexity: profile?.complexity ?? this.inferComplexity(exercise) };
    }));
  }

  private gradeStructure(plan: FlowPlan, items: GradedItem[]): FlowGradeCategory {
    const populated = new Set(items.map(item => item.segment.id));
    const points = [plan.segments.some(segment => populated.has(segment.id) && this.isPreparation(segment)), plan.segments.some(segment => populated.has(segment.id) && this.isMain(segment)), plan.segments.some(segment => populated.has(segment.id) && this.isClosing(segment))].filter(Boolean).length;
    return this.category('structure', 'Structure and purpose', points * 20 / 3, 20, points === 3 ? 'Preparation, main work, and closing are all represented.' : 'The flow has a recognizable shape, but one phase is not yet clear.');
  }

  private gradeBalance(items: GradedItem[]): FlowGradeCategory {
    const actions = new Set(items.flatMap(item => item.actions));
    const points = [actions.has('flexion') && actions.has('extension'), actions.has('rotation') || actions.has('lateral-flexion'), actions.has('neutral')].filter(Boolean).length;
    return this.category('balance', 'Movement balance', points * 20 / 3, 20, points >= 2 ? 'The movement vocabulary has useful variety.' : 'The flow leans heavily on one movement pattern.');
  }

  private gradeProgression(items: GradedItem[]): FlowGradeCategory {
    if (items.length < 2) return this.category('progression', 'Progression', 5, 15, 'Add more exercises to assess progression.');
    let increases = 0; let reversals = 0;
    for (let index = 1; index < items.length; index++) { const difference = items[index].complexity - items[index - 1].complexity; if (difference >= 0) increases++; if (difference > 1) reversals++; }
    const score = Math.max(0, Math.round((increases / (items.length - 1) * 15) - reversals * 2));
    return this.category('progression', 'Progression', score, 15, reversals ? 'At least one jump in complexity may arrive before the body is prepared.' : 'Challenge builds without abrupt jumps.');
  }

  private gradePrinciples(items: GradedItem[]): FlowGradeCategory {
    const breath = items.filter(item => item.breath).length / items.length;
    const centered = items.filter(item => item.centered).length / items.length;
    const expansion = items.filter(item => item.expansion).length / items.length;
    const score = Math.round(((breath + centered + expansion) / 3) * 20);
    return this.category('principles', 'Breath, centering, and expansion', score, 20, breath >= .6 && centered >= .6 && expansion >= .4 ? 'Breath, center, and length are present throughout the flow.' : 'Breath, center, or expansion is inconsistent.');
  }

  private gradeTransitions(items: GradedItem[]): FlowGradeCategory {
    if (items.length < 2) return this.category('transitions', 'Control and flow', 0, 10, 'Add at least two exercises to assess transitions.');
    let changes = 0;
    for (let index = 1; index < items.length; index++) if (items[index].exercise?.movementProfile?.bodyPosition !== items[index - 1].exercise?.movementProfile?.bodyPosition) changes++;
    return this.category('transitions', 'Control and flow', Math.max(0, 10 - Math.max(0, changes - 2) * 2), 10, changes <= 2 ? 'Transitions are economical and support a continuous flow.' : 'Frequent position changes may interrupt the rhythm of the class.');
  }

  private findShortcomings(plan: FlowPlan, items: GradedItem[]): FlowShortcoming[] {
    if (!items.length) return [this.issue('empty', 'No exercises yet', 'The flow cannot be graded until it has exercises.', 'Add preparation, main-work, and closing exercises.', [], [])];
    const issues: FlowShortcoming[] = []; const actions = new Set(items.flatMap(item => item.actions));
    if (!plan.segments.some(segment => this.isPreparation(segment))) issues.push(this.issue('no-preparation', 'Preparation is missing', 'The flow begins without a clearly identified arrival phase.', 'Start with breath, alignment, or gentle stability work.', plan.segments.slice(0, 1).map(segment => segment.id), []));
    if (!plan.segments.some(segment => this.isClosing(segment))) issues.push(this.issue('no-closing', 'Closing is missing', 'There is no clear downshift or integration phase.', 'Finish with breath, length, gentle mobility, or a simple takeaway.', plan.segments.slice(-1).map(segment => segment.id), []));
    if (actions.has('flexion') && !actions.has('extension')) issues.push(this.issue('flexion-heavy', 'Flexion is not balanced', 'The flow includes flexion without a clear extension counterpoint.', 'Add supported extension or neutral-spine work if it suits the class goal.', this.uniqueSegments(items), this.uniqueExercises(items)));
    if (items.filter(item => item.breath).length / items.length < .5) issues.push(this.issue('breath', 'Breath guidance is sparse', 'Fewer than half of the exercises have breathing guidance.', 'Add breath cues to plan notes or choose exercises with clear breathing instructions.', this.uniqueSegments(items), []));
    return issues;
  }

  private findStrengths(categories: FlowGradeCategory[], items: GradedItem[]): string[] { return categories.filter(category => category.score / category.maxScore >= .75).map(category => category.summary).slice(0, 3).concat(items.length >= 5 ? ['The flow has enough variety for a meaningful sequence review.'] : []); }
  private category(id: string, label: string, score: number, maxScore: number, summary: string): FlowGradeCategory { const value = Math.max(0, Math.min(maxScore, Math.round(score))); return { id, label, score: value, maxScore, status: this.getStatus(Math.round(value / maxScore * 100)), summary }; }
  private issue(id: string, title: string, description: string, suggestion: string, segmentIds: string[], exerciseIds: string[]): FlowShortcoming { return { id, severity: 'attention', title, description, suggestion, segmentIds, exerciseIds }; }
  private uniqueSegments(items: GradedItem[]): string[] { return [...new Set(items.map(item => item.segment.id))]; }
  private uniqueExercises(items: GradedItem[]): string[] { return [...new Set(items.map(item => item.item.exerciseId))]; }
  private isPreparation(segment: FlowSegment): boolean { return /arrival|warm|prep/i.test(`${segment.id} ${segment.name} ${segment.intent}`); }
  private isClosing(segment: FlowSegment): boolean { return /clos|cool|integrat|downshift/i.test(`${segment.id} ${segment.name} ${segment.intent}`); }
  private isMain(segment: FlowSegment): boolean { return !this.isPreparation(segment) && !this.isClosing(segment); }
  private getStatus(score: number): 'strong' | 'developing' | 'needs-attention' { return score >= 75 ? 'strong' : score >= 50 ? 'developing' : 'needs-attention'; }
  private exerciseText(exercise?: Exercise): string { return [exercise?.name, exercise?.shortDescription, exercise?.focus, exercise?.benefits, exercise?.breathing, exercise?.primaryMuscles?.join(' ')].filter(Boolean).join(' ').toLowerCase(); }
  private hasAny(text: string, terms: string[]): boolean { return terms.some(term => text.includes(term)); }
  private inferActions(text: string): SpinalAction[] { const actions: SpinalAction[] = []; if (this.hasAny(text, ['flexion', 'forward', 'roll up', 'roll down', 'curl', 'round'])) actions.push('flexion'); if (this.hasAny(text, ['extension', 'swan', 'back extension', 'chest lift'])) actions.push('extension'); if (this.hasAny(text, ['twist', 'rotation', 'mermaid'])) actions.push('rotation'); if (this.hasAny(text, ['side bend', 'lateral'])) actions.push('lateral-flexion'); if (this.hasAny(text, ['neutral', 'stability', 'stabil'])) actions.push('neutral'); return actions.length ? actions : ['neutral']; }
  private inferComplexity(exercise?: Exercise): number { return exercise?.level === 'Advanced' ? 4 : exercise?.level === 'Intermediate' ? 3 : 1; }
}