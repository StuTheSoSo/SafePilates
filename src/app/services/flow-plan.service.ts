import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlowItem, FlowPlan, FlowSegment, Program } from '../models';

const CURRENT_PLAN_KEY = 'flowsmith-current-plan';
const LAST_EDITED_KEY = 'flowsmith-current-plan-edited';
const SAVED_FLOWS_KEY = 'flowsmith-saved-flows';

@Injectable({ providedIn: 'root' })
export class FlowPlanService {
  private readonly currentPlanSubject = new BehaviorSubject<FlowPlan>(this.readStoredPlan() ?? this.createBlankPlan());
  readonly currentPlan$ = this.currentPlanSubject.asObservable();
  private lastEditedAtValue = this.readLastEditedAt();
  private readonly savedFlowsSubject = new BehaviorSubject<FlowPlan[]>(this.readStoredFlows());
  readonly savedFlows$ = this.savedFlowsSubject.asObservable();

  get currentPlan(): FlowPlan {
    return this.currentPlanSubject.value;
  }

  get lastEditedAt(): Date | null {
    return this.lastEditedAtValue;
  }

  get savedFlows(): FlowPlan[] {
    return this.savedFlowsSubject.value;
  }

  updateCurrentPlan(plan: FlowPlan): void {
    this.currentPlanSubject.next(plan);
    this.lastEditedAtValue = new Date();
    localStorage.setItem(CURRENT_PLAN_KEY, JSON.stringify(plan));
    localStorage.setItem(LAST_EDITED_KEY, this.lastEditedAtValue.toISOString());
  }

  saveCurrentPlanAsFlow(name?: string): FlowPlan {
    const plan = this.currentPlan;
    const trimmedName = (name ?? plan.name).trim();
    if (!trimmedName) {
      throw new Error('A flow title is required.');
    }

    plan.name = trimmedName;
    if (!this.savedFlows.some((flow) => flow.id === plan.id)) {
      plan.id = this.createSavedFlowId();
    }
    plan.savedAt = new Date().toISOString();

    const snapshot = this.clonePlan(plan);
    const nextFlows = this.savedFlows.some((flow) => flow.id === snapshot.id)
      ? this.savedFlows.map((flow) => flow.id === snapshot.id ? snapshot : flow)
      : [...this.savedFlows, snapshot];
    this.persistSavedFlows(nextFlows);
    this.updateCurrentPlan(plan);
    return plan;
  }

  loadSavedFlowIntoPlanner(flowId: string): FlowPlan | null {
    const flow = this.savedFlows.find((candidate) => candidate.id === flowId);
    if (!flow) {
      return null;
    }

    const plan = this.clonePlan(flow);
    this.updateCurrentPlan(plan);
    return plan;
  }

  deleteSavedFlow(flowId: string): void {
    this.persistSavedFlows(this.savedFlows.filter((flow) => flow.id !== flowId));
  }

  startBlankFlow(name = ''): FlowPlan {
    const plan = this.createBlankPlan(name);
    this.updateCurrentPlan(plan);
    return plan;
  }

  createPlanFromProgram(program: Program): FlowPlan {
    const items = program.exerciseIds.map((exerciseId) => this.createItem(exerciseId, 5, 'Mat', ''));
    return {
      id: `template-${program.id}`,
      name: program.name,
      clientName: 'Class plan',
      goal: program.goal || program.description || 'PilateSafe template flow',
      selectedConditionIds: [],
      segments: this.createProgramSegments(program, items),
    };
  }

  clonePlan(plan: FlowPlan): FlowPlan {
    return {
      ...plan,
      selectedConditionIds: [...plan.selectedConditionIds],
      segments: plan.segments.map((segment) => ({
        ...segment,
        items: segment.items.map((item) => ({ ...item })),
      })),
    };
  }

  private createBlankPlan(name = ''): FlowPlan {
    return {
      id: `flow-${Date.now().toString(36)}`,
      name,
      clientName: 'Class plan',
      goal: '',
      selectedConditionIds: [],
      segments: [
        this.createSegment('arrival', 'Arrival', 'Breath, alignment, and nervous system settling', []),
        this.createSegment('main-flow', 'Main Flow', 'Build heat with connected core and full-body work', []),
        this.createSegment('closing', 'Closing', 'Downshift, integrate, and leave one clear takeaway', []),
      ],
    };
  }

  private createSavedFlowId(): string {
    return `saved-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  private createProgramSegments(program: Program, items: FlowItem[]): FlowSegment[] {
    if (items.length <= 4) {
      return [this.createSegment('main-flow', 'Main Flow', program.goal || 'Teach the selected template.', items)];
    }

    const arrivalCount = Math.min(2, Math.max(1, Math.floor(items.length * 0.2)));
    const closingCount = Math.min(2, Math.max(1, Math.floor(items.length * 0.2)));
    return [
      this.createSegment('arrival', 'Arrival', 'Prepare breath, alignment, and movement quality.', items.slice(0, arrivalCount)),
      this.createSegment('main-flow', 'Main Flow', program.goal || 'Teach the main template sequence.', items.slice(arrivalCount, items.length - closingCount)),
      this.createSegment('closing', 'Closing', 'Integrate and downshift before closing the class.', items.slice(items.length - closingCount)),
    ];
  }

  private createSegment(id: string, name: string, intent: string, items: FlowItem[]): FlowSegment {
    return { id, name, intent, durationTargetMinutes: items.reduce((total, item) => total + item.durationMinutes, 0), items };
  }

  private createItem(exerciseId: string, durationMinutes: number, apparatus: string, notes: string): FlowItem {
    return { id: `${exerciseId}-${Math.random().toString(36).slice(2, 8)}`, exerciseId, durationMinutes, apparatus, notes };
  }

  private readStoredPlan(): FlowPlan | null {
    const stored = localStorage.getItem(CURRENT_PLAN_KEY);
    if (!stored) return null;
    try {
      const plan = JSON.parse(stored) as FlowPlan;
      return plan.id && Array.isArray(plan.segments) ? plan : null;
    } catch {
      return null;
    }
  }

  private readStoredFlows(): FlowPlan[] {
    const stored = localStorage.getItem(SAVED_FLOWS_KEY);
    if (!stored) return [];
    try {
      const flows = JSON.parse(stored) as FlowPlan[];
      return Array.isArray(flows) ? flows.filter((flow) => flow?.id && Array.isArray(flow.segments)) : [];
    } catch {
      return [];
    }
  }

  private persistSavedFlows(flows: FlowPlan[]): void {
    this.savedFlowsSubject.next(flows);
    localStorage.setItem(SAVED_FLOWS_KEY, JSON.stringify(flows));
  }

  private readLastEditedAt(): Date | null {
    const stored = localStorage.getItem(LAST_EDITED_KEY);
    if (!stored) return null;
    const date = new Date(stored);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}