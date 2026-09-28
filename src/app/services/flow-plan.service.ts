import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlowItem, FlowPlan, FlowSegment, Program } from '../models';
import { ClientService } from './client.service';

const CURRENT_PLAN_KEY = 'flowsmith-current-plan';
const LAST_EDITED_KEY = 'flowsmith-current-plan-edited';
const SAVED_FLOWS_KEY = 'flowsmith-saved-flows';

@Injectable({ providedIn: 'root' })
export class FlowPlanService {
  private readonly clientService = inject(ClientService);
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

  loadSavedFlowForEditing(flowId: string): FlowPlan | null {
    const flow = this.savedFlows.find((candidate) => candidate.id === flowId);
    if (!flow) return null;
    const plan = this.refreshClientContext(this.clonePlan(flow));
    this.updateCurrentPlan(plan);
    return plan;
  }

  loadSavedFlowIntoPlanner(flowId: string): FlowPlan | null {
    return this.loadSavedFlowForEditing(flowId);
  }

  createDraftFromSavedFlow(flowId: string): FlowPlan | null {
    const flow = this.savedFlows.find((candidate) => candidate.id === flowId);
    if (!flow) return null;
    const draft = this.refreshClientContext(this.clonePlan(flow));
    draft.id = this.createDraftId();
    delete draft.savedAt;
    this.updateCurrentPlan(draft);
    return draft;
  }

  duplicateSavedFlow(flowId: string): FlowPlan | null {
    const flow = this.savedFlows.find((candidate) => candidate.id === flowId);
    if (!flow) return null;
    const duplicate = this.clonePlan(flow);
    duplicate.id = this.createSavedFlowId();
    duplicate.name = `${duplicate.name} Copy`;
    duplicate.savedAt = new Date().toISOString();
    this.persistSavedFlows([...this.savedFlows, duplicate]);
    return duplicate;
  }

  renameSavedFlow(flowId: string, name: string): FlowPlan | null {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('A flow title is required.');
    const flow = this.savedFlows.find((candidate) => candidate.id === flowId);
    if (!flow) return null;
    const renamed = { ...flow, name: trimmedName, savedAt: new Date().toISOString() };
    this.persistSavedFlows(this.savedFlows.map((candidate) => candidate.id === flowId ? renamed : candidate));
    return renamed;
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

  private createDraftId(): string {
    return `flow-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
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
      return this.normalizePlan(JSON.parse(stored));
    } catch {
      return null;
    }
  }

  private readStoredFlows(): FlowPlan[] {
    const stored = localStorage.getItem(SAVED_FLOWS_KEY);
    if (!stored) return [];
    try {
      const flows = JSON.parse(stored) as unknown[];
      return Array.isArray(flows)
        ? flows.map((flow) => this.normalizePlan(flow)).filter((flow): flow is FlowPlan => !!flow)
        : [];
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

  private normalizePlan(value: unknown): FlowPlan | null {
    if (!value || typeof value !== 'object') return null;
    const raw = value as Partial<FlowPlan>;
    if (typeof raw.id !== 'string' || !Array.isArray(raw.segments)) return null;
    return {
      id: raw.id,
      name: typeof raw.name === 'string' ? raw.name : '',
      clientId: typeof raw.clientId === 'string' ? raw.clientId : undefined,
      clientName: typeof raw.clientName === 'string' ? raw.clientName : 'Class plan',
      goal: typeof raw.goal === 'string' ? raw.goal : '',
      selectedConditionIds: Array.isArray(raw.selectedConditionIds) ? raw.selectedConditionIds.filter((id): id is string => typeof id === 'string') : [],
      savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : undefined,
      segments: raw.segments.filter((segment): segment is FlowSegment => !!segment && typeof segment === 'object').map((segment) => ({
        id: typeof segment.id === 'string' ? segment.id : `segment-${Math.random().toString(36).slice(2, 7)}`,
        name: typeof segment.name === 'string' ? segment.name : 'Flow section',
        intent: typeof segment.intent === 'string' ? segment.intent : '',
        durationTargetMinutes: typeof segment.durationTargetMinutes === 'number' ? segment.durationTargetMinutes : 0,
        items: Array.isArray(segment.items) ? segment.items.filter((item): item is FlowItem => !!item && typeof item === 'object').map((item) => ({
          id: typeof item.id === 'string' ? item.id : `item-${Math.random().toString(36).slice(2, 7)}`,
          exerciseId: typeof item.exerciseId === 'string' ? item.exerciseId : '',
          durationMinutes: typeof item.durationMinutes === 'number' ? item.durationMinutes : 5,
          notes: typeof item.notes === 'string' ? item.notes : '',
          apparatus: typeof item.apparatus === 'string' ? item.apparatus : 'Mat',
        })) : [],
      })),
    };
  }

  private refreshClientContext(plan: FlowPlan): FlowPlan {
    if (!plan.clientId) return plan;
    const client = this.clientService.getClientById(plan.clientId);
    if (!client) return plan;
    return { ...plan, clientName: client.name, selectedConditionIds: [...client.conditionIds] };
  }
}