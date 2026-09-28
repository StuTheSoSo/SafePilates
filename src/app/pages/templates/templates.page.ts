import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FlowPlanService } from '../../services/flow-plan.service';
import { FlowRunnerService } from '../../services/flow-runner.service';
import { Exercise, FlowPlan } from '../../models';
import { SafetyService } from '../../services/safety.service';

@Component({ selector: 'app-templates', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './templates.page.html', styleUrls: ['./templates.page.scss'] })
export class TemplatesPage implements OnInit, OnDestroy {
  readonly flowPlanService = inject(FlowPlanService);
  private readonly safetyService = inject(SafetyService);
  private readonly flowRunner = inject(FlowRunnerService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private exercises: Exercise[] = [];
  flows = this.flowPlanService.savedFlows;
  newBlankFlow(): void {
    this.flowPlanService.startBlankFlow();
    this.router.navigate(['/planner'], { queryParams: { mode: 'new' } });
  }
  private savedFlowsSubscription?: Subscription;

  async ngOnInit(): Promise<void> {
    this.savedFlowsSubscription = this.flowPlanService.savedFlows$.subscribe(flows => this.flows = flows);
    await this.safetyService.initData();
    this.exercises = this.safetyService.getExercises();
  }

  ngOnDestroy(): void {
    this.savedFlowsSubscription?.unsubscribe();
  }

  durationMinutes(flow: FlowPlan): number {
    return flow.segments.reduce((total, segment) => total + segment.items.reduce((sum, item) => sum + item.durationMinutes, 0), 0);
  }

  exerciseCount(flow: FlowPlan): number {
    return flow.segments.reduce((total, segment) => total + segment.items.length, 0);
  }

  level(flow: FlowPlan): string {
    const rank: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };
    const levels = flow.segments.flatMap(segment => segment.items)
      .map(item => this.exercises.find(exercise => exercise.id === item.exerciseId)?.level ?? '')
      .filter(Boolean);
    return levels.sort((left, right) => (rank[right] ?? 0) - (rank[left] ?? 0))[0] || 'Blank flow';
  }

  editFlow(id: string): void {
    this.router.navigate(['/planner'], { queryParams: { flow: id, mode: 'edit' } });
  }

  useAsNew(id: string): void {
    if (this.flowPlanService.createDraftFromSavedFlow(id)) this.router.navigateByUrl('/planner');
  }

  runFlow(flow: FlowPlan): void {
    this.flowRunner.loadPlan(flow);
    this.router.navigateByUrl('/run');
  }

  duplicateFlow(id: string): void {
    this.flowPlanService.duplicateSavedFlow(id);
  }

  async renameFlow(flow: FlowPlan): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Rename flow',
      inputs: [{ name: 'name', type: 'text', value: flow.name, placeholder: 'Flow name' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Save', handler: (data) => { this.flowPlanService.renameSavedFlow(flow.id, String(data?.name ?? '')); } },
      ],
    });
    await alert.present();
  }

  async deleteFlow(flow: FlowPlan): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete saved flow?',
      message: `Delete “${flow.name}”? This cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => this.flowPlanService.deleteSavedFlow(flow.id) },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    this.flows = this.flowPlanService.savedFlows;
    this.changeDetector.detectChanges();
  }
}