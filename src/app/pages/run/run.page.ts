import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FlowRunnerService } from '../../services/flow-runner.service';
import { FlowPlanService } from '../../services/flow-plan.service';
import { SafetyNoticeService } from '../../services/safety-notice.service';
import { SafetyService } from '../../services/safety.service';
import { FlowSegment, RunExercise } from '../../models';

@Component({ selector: 'app-run', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './run.page.html', styleUrls: ['./run.page.scss'] })
export class RunPage implements OnInit, OnDestroy {
  readonly runner = inject(FlowRunnerService);
  private readonly planService = inject(FlowPlanService);
  private readonly safetyNotice = inject(SafetyNoticeService);
  private readonly safetyService = inject(SafetyService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private lastCompletedExerciseId = '';
  state = this.runner.state;
  status = this.state.status;
  completionMessage = '';
  exercisesLoaded = false;
  teachingMode = false;
  private ownsFullscreen = false;

  async ngOnInit(): Promise<void> {
    if (!this.runner.state.exercises.length && this.planService.currentPlan.segments.some(segment => segment.items.length)) this.runner.loadPlan(this.planService.currentPlan);
    await this.safetyService.initData();
    this.exercisesLoaded = true;
    this.subscription = this.runner.state$.subscribe(state => {
      this.state = state;
      this.status = state.status;
      if (state.status === 'completed' && this.teachingMode) void this.releaseTeachingMode();
      if (state.status === 'ready' && this.teachingMode) void this.releaseTeachingMode();
      if (state.completedExerciseId && state.completedExerciseId !== this.lastCompletedExerciseId) {
        this.lastCompletedExerciseId = state.completedExerciseId;
        this.completionMessage = `${this.exerciseName(state.exercises[state.currentIndex - (state.completedExerciseId === state.exercises[state.currentIndex]?.id ? 0 : 1)])} complete`;
      } else if (!state.completedExerciseId) {
        this.lastCompletedExerciseId = '';
        this.completionMessage = '';
      }
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.runner.pauseOnRouteLeave();
    void this.releaseTeachingMode();
    this.subscription?.unsubscribe();
  }

  get current(): RunExercise | undefined { return this.state.exercises[this.state.currentIndex]; }
  get next(): RunExercise | undefined { return this.state.exercises[this.state.currentIndex + 1]; }
  get isRunning(): boolean { return this.status === 'running'; }
  get isPaused(): boolean { return this.status === 'paused'; }
  get isSetup(): boolean { return this.status === 'setup'; }
  get isCompleted(): boolean { return this.status === 'completed'; }
  get hasClass(): boolean { return this.state.exercises.length > 0; }
  get progressPercent(): number { return Math.round(this.runner.progress * 100); }
  get remainingSeconds(): number { return this.runner.remainingSeconds; }
  get totalRemainingSeconds(): number { return this.runner.getTotalRemainingSeconds(); }
  get totalDurationSeconds(): number { return this.runner.getTotalDurationSeconds(); }
  get canEditDuration(): boolean { return !!this.current && ['ready', 'setup', 'paused'].includes(this.status); }
  get minimumDurationSeconds(): number { return Math.max(15, this.state.currentExerciseElapsedSeconds + 1); }
  get warnings() { return this.current ? this.safetyService.getExerciseWarnings(this.current.exerciseId, this.state.plan.selectedConditionIds) : []; }
  get segments(): FlowSegment[] { return this.state.plan.segments; }

  async startTeaching(): Promise<void> {
    if (!this.safetyNotice.acknowledged) {
      await this.router.navigateByUrl('/safety?returnTo=run');
      return;
    }
    this.runner.start();
    if (this.runner.state.status === 'running') await this.enterTeachingMode();
  }

  async stopTeaching(): Promise<void> { this.runner.pause(); await this.releaseTeachingMode(); }
  nextExercise(): void { this.runner.next(); }
  previousExercise(): void { this.runner.previous(); }
  restartExercise(): void { this.runner.restartExercise(); }
  restartFlow(): void { this.runner.loadPlan(this.state.plan, this.state.source); }
  backToPlanner(): void { this.runner.pauseOnRouteLeave(); this.router.navigateByUrl('/planner'); }

  async startNewFlow(): Promise<void> {
    const alert = await this.alertController.create({ header: 'Start a new flow?', message: 'This will replace the current draft. Save it to your flow library first if you want to keep it.', buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'New flow', role: 'confirm' }] });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') return;
    await this.router.navigateByUrl('/planner?mode=new');
  }

  adjustDuration(seconds: number): void {
    if (this.current) this.runner.updateCurrentExerciseDuration(this.current.durationSeconds + seconds);
  }

  async confirmStop(): Promise<void> {
    const alert = await this.alertController.create({ header: 'Stop flow?', message: 'Your current position will be saved for recovery.', buttons: [{ text: 'Cancel', role: 'cancel' }, { text: 'Stop', role: 'destructive', handler: () => { this.runner.stop(); void this.releaseTeachingMode(); } }] });
    await alert.present();
  }

  formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  exerciseName(exercise: RunExercise | undefined): string { return exercise ? this.safetyService.getExerciseById(exercise.exerciseId)?.name ?? exercise.exerciseId : 'Exercise'; }
  exerciseFocus(exercise: RunExercise | undefined): string { return exercise ? this.safetyService.getExerciseById(exercise.exerciseId)?.focus ?? '' : ''; }
  stageStatus(segment: FlowSegment): 'complete' | 'current' | 'upcoming' {
    const indices = this.state.exercises.map((exercise, index) => exercise.segmentId === segment.id ? index : -1).filter(index => index >= 0);
    if (!indices.length) return 'upcoming';
    if (!this.isCompleted && indices.includes(this.state.currentIndex)) return 'current';
    return indices.every(index => index < this.state.currentIndex || this.isCompleted) ? 'complete' : 'upcoming';
  }

  private async enterTeachingMode(): Promise<void> {
    this.teachingMode = true;
    if (!Capacitor.isNativePlatform() && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      try { await document.documentElement.requestFullscreen(); this.ownsFullscreen = true; } catch {}
    }
    try { await ScreenOrientation.lock({ orientation: 'landscape' }); } catch {}
  }

  private async releaseTeachingMode(): Promise<void> {
    this.teachingMode = false;
    try {
      if (Capacitor.isNativePlatform()) await ScreenOrientation.lock({ orientation: 'portrait' });
      else await ScreenOrientation.unlock();
    } catch {}
    if (this.ownsFullscreen && document.fullscreenElement) {
      this.ownsFullscreen = false;
      try { await document.exitFullscreen(); } catch {}
    }
  }
}
