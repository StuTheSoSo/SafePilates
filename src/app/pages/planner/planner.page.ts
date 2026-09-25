import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Exercise, FlowItem, FlowPlan, FlowSegment, Condition, ClientProfile } from '../../models';
import { FlowPlanService } from '../../services/flow-plan.service';
import { SafetyService } from '../../services/safety.service';
import { FlowGradingService } from '../../services/flow-grading.service';
import { ClientService } from '../../services/client.service';
import { FlowGradeReport } from '../../models';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './planner.page.html',
  styleUrls: ['./planner.page.scss']
})
export class PlannerPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly flowPlanService = inject(FlowPlanService);
  readonly safetyService = inject(SafetyService);
  readonly gradingService = inject(FlowGradingService);
  readonly clientService = inject(ClientService);
  plan: FlowPlan = this.flowPlanService.currentPlan;
  activeSegmentId = this.plan.segments[0]?.id ?? 'main-flow';
  searchTerm = '';
  selectedConditionIds: string[] = [];
  conditions: Condition[] = [];
  clients: ClientProfile[] = [];
  selectedClientId = '';
  conditionSearch = '';
  conditionCategory = 'All';
  showAllConditions = false;
  exercises: Exercise[] = [];
  warningAcknowledged = false;
  expandedItemId = '';
  flowGrade: FlowGradeReport | null = null;
  gradeExpanded = false;

  async ngOnInit(): Promise<void> {
    await this.safetyService.initData();
    this.conditions = this.safetyService.getConditions();
    this.exercises = this.safetyService.getExercises();
    this.clients = this.clientService.getClients();
    const flowId = this.route.snapshot.queryParamMap.get('flow');
    if (flowId) {
      this.flowPlanService.loadSavedFlowIntoPlanner(flowId);
    }
    this.plan = this.flowPlanService.currentPlan;
    this.selectedClientId = this.plan.clientId ?? '';
    this.selectedConditionIds = [...this.plan.selectedConditionIds];
    this.refreshGrade();
  }

  get activeSegment(): FlowSegment {
    return this.plan.segments.find(segment => segment.id === this.activeSegmentId) ?? this.plan.segments[0];
  }

  get filteredExercises(): Exercise[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.exercises.filter(exercise => !query || [exercise.name, exercise.category, exercise.focus, exercise.equipment]
      .filter(Boolean).join(' ').toLowerCase().includes(query)).slice(0, 80);
  }

  get conditionCategories(): string[] {
    return ['All', ...new Set(this.conditions.map(condition => this.conditionGroup(condition)))];
  }

  get visibleConditions(): Condition[] {
    const query = this.conditionSearch.trim().toLowerCase();
    return this.conditions.filter(condition => {
      const matchesQuery = !query || `${condition.label} ${condition.description}`.toLowerCase().includes(query);
      const matchesCategory = this.conditionCategory === 'All' || this.conditionGroup(condition) === this.conditionCategory;
      return matchesQuery && matchesCategory && (this.showAllConditions || !!query || this.selectedConditionIds.includes(condition.id));
    });
  }

  selectClient(clientId: string): void {
    this.selectedClientId = clientId;
    const client = this.clients.find(candidate => candidate.id === clientId);
    this.plan.clientId = client?.id;
    this.plan.clientName = client?.name ?? 'Class plan';
    this.selectedConditionIds = client ? [...client.conditionIds] : [];
    this.commit();
    this.warningAcknowledged = false;
    this.refreshGrade();
  }

  toggleConditionBrowser(): void {
    this.showAllConditions = !this.showAllConditions;
    if (this.showAllConditions) this.conditionSearch = '';
  }

  get warnings() {
    return this.plan.segments.flatMap(segment => segment.items.flatMap(item =>
      this.safetyService.getExerciseWarnings(item.exerciseId, this.selectedConditionIds).map(warning => ({
        item,
        exercise: this.exerciseFor(item),
        warning,
      }))
    ));
  }

  get planDurationMinutes(): number {
    return this.plan.segments.reduce((total, segment) => total + this.segmentDuration(segment), 0);
  }

  get planExerciseCount(): number {
    return this.plan.segments.reduce((total, segment) => total + segment.items.length, 0);
  }

  toggleCondition(conditionId: string): void {
    this.selectedConditionIds = this.selectedConditionIds.includes(conditionId)
      ? this.selectedConditionIds.filter(id => id !== conditionId)
      : [...this.selectedConditionIds, conditionId];
    this.commit();
    this.warningAcknowledged = false;
    this.refreshGrade();
  }

  removeCondition(conditionId: string): void {
    this.selectedConditionIds = this.selectedConditionIds.filter(id => id !== conditionId);
    this.commit();
    this.warningAcknowledged = false;
    this.refreshGrade();
  }

  conditionLabel(conditionId: string): string {
    return this.conditions.find(condition => condition.id === conditionId)?.label ?? conditionId;
  }

  toggleGrade(): void {
    this.gradeExpanded = !this.gradeExpanded;
  }

  addExercise(exercise: Exercise): void {
    if (this.isExerciseLocked(exercise)) {
      this.router.navigateByUrl('/upgrade');
      return;
    }
    this.activeSegment.items = [...this.activeSegment.items, {
      id: `${exercise.id}-${Date.now().toString(36)}`,
      exerciseId: exercise.id,
      durationMinutes: 5,
      notes: '',
      apparatus: exercise.equipment || 'Mat',
    }];
    this.commit();
    this.refreshGrade();
  }

  isExerciseLocked(exercise: Exercise): boolean {
    return this.safetyService.isExercisePremium(exercise) && !this.safetyService.isPremiumActive();
  }

  removeItem(item: FlowItem): void {
    this.activeSegment.items = this.activeSegment.items.filter(candidate => candidate.id !== item.id);
    this.commit();
    this.refreshGrade();
  }

  adjustDuration(item: FlowItem, amount: number): void {
    item.durationMinutes = Math.max(.25, Math.round((item.durationMinutes + amount) * 4) / 4);
    this.commit();
  }

  saveFlow(): void {
    const name = this.plan.name.trim() || window.prompt('Name this flow')?.trim();
    if (!name) return;
    this.plan.name = name;
    this.flowPlanService.saveCurrentPlanAsFlow(name);
  }

  startRun(): void {
    if (this.warnings.length && !this.warningAcknowledged) return;
    localStorage.setItem('pilatesafe-run-safety-acknowledged', 'true');
    this.flowPlanService.updateCurrentPlan(this.plan);
    this.router.navigateByUrl('/run');
  }

  exerciseFor(item: FlowItem): Exercise | undefined {
    return this.exercises.find(exercise => exercise.id === item.exerciseId);
  }

  segmentDuration(segment: FlowSegment): number {
    return segment.items.reduce((total, item) => total + item.durationMinutes, 0);
  }

  private commit(): void {
    this.plan.selectedConditionIds = [...this.selectedConditionIds];
    this.flowPlanService.updateCurrentPlan(this.plan);
  }

  private refreshGrade(): void {
    this.flowGrade = this.gradingService.gradeFlow(this.plan, {
      exercises: this.exercises,
      conditions: this.conditions,
      contraindications: {},
      programs: [],
    });
  }

  private conditionGroup(condition: Condition): string {
    const text = `${condition.id} ${condition.label}`.toLowerCase();
    if (/pregnan|postpartum|pelvic|diastasis|menopause/.test(text)) return 'Pregnancy & postpartum';
    if (/heart|cardio|blood|diabetes|respiratory|fatigue/.test(text)) return 'Medical & cardiovascular';
    if (/neuro|multiple|vertigo|balance|cognitive/.test(text)) return 'Neurological & balance';
    return 'Musculoskeletal & movement';
  }
}