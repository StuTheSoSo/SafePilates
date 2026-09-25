import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClassRunState, FlowPlan, RunExercise, RunnerStatus } from '../models';

const RUNNER_STATE_KEY = 'pilatesafe-runner-state';

@Injectable({ providedIn: 'root' })
export class FlowRunnerService {
  private timer?: ReturnType<typeof setInterval>;
  private readonly stateSubject = new BehaviorSubject<ClassRunState>(this.readState() ?? this.emptyState());
  readonly state$ = this.stateSubject.asObservable();

  get state(): ClassRunState { return this.stateSubject.value; }

  loadPlan(plan: FlowPlan): void {
    this.stop();
    const exercises: RunExercise[] = plan.segments.flatMap(segment => segment.items.map(item => ({
      id: item.id,
      exerciseId: item.exerciseId,
      segmentId: segment.id,
      segmentName: segment.name,
      durationSeconds: Math.max(15, Math.round(item.durationMinutes * 60)),
      notes: item.notes,
      apparatus: item.apparatus,
    })));
    this.emit({ source: 'planner', plan, exercises, currentIndex: 0, currentExerciseElapsedSeconds: 0, elapsedSeconds: 0, status: 'ready' });
  }

  start(): void {
    if (!this.state.exercises.length || this.state.status === 'completed') return;
    this.emit({ ...this.state, status: 'running' });
    this.startTimer();
  }

  pause(): void {
    if (this.state.status !== 'running') return;
    this.clearTimer();
    this.emit({ ...this.state, status: 'paused' });
  }

  toggle(): void { this.state.status === 'running' ? this.pause() : this.start(); }

  next(): void {
    if (this.state.currentIndex >= this.state.exercises.length - 1) {
      this.complete();
      return;
    }
    this.emit({ ...this.state, currentIndex: this.state.currentIndex + 1, currentExerciseElapsedSeconds: 0 });
  }

  previous(): void {
    this.emit({ ...this.state, currentIndex: Math.max(0, this.state.currentIndex - 1), currentExerciseElapsedSeconds: 0, status: this.state.status === 'completed' ? 'paused' : this.state.status });
  }

  stop(): void {
    this.clearTimer();
    localStorage.removeItem(RUNNER_STATE_KEY);
    this.stateSubject.next(this.emptyState());
  }

  get current(): RunExercise | undefined { return this.state.exercises[this.state.currentIndex]; }
  get remainingSeconds(): number { return Math.max(0, (this.current?.durationSeconds ?? 0) - this.state.currentExerciseElapsedSeconds); }
  get progress(): number { return this.state.exercises.length ? this.state.elapsedSeconds / this.state.exercises.reduce((sum, item) => sum + item.durationSeconds, 0) : 0; }

  formatSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.clearTimer();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    if (this.state.status !== 'running') return;
    const state = { ...this.state, currentExerciseElapsedSeconds: this.state.currentExerciseElapsedSeconds + 1, elapsedSeconds: this.state.elapsedSeconds + 1 };
    this.emit(state);
    if (state.currentExerciseElapsedSeconds >= (state.exercises[state.currentIndex]?.durationSeconds ?? 0)) this.next();
  }

  private complete(): void {
    this.clearTimer();
    this.emit({ ...this.state, status: 'completed', currentExerciseElapsedSeconds: this.current?.durationSeconds ?? 0 });
  }

  private emit(state: ClassRunState): void {
    this.stateSubject.next(state);
    localStorage.setItem(RUNNER_STATE_KEY, JSON.stringify(state));
  }

  private emptyState(): ClassRunState { return { source: 'planner', plan: { id: '', name: '', clientName: '', goal: '', selectedConditionIds: [], segments: [] }, exercises: [], currentIndex: 0, currentExerciseElapsedSeconds: 0, elapsedSeconds: 0, status: 'ready' }; }

  private readState(): ClassRunState | null {
    try {
      const state = JSON.parse(localStorage.getItem(RUNNER_STATE_KEY) ?? 'null') as ClassRunState | null;
      return state?.plan && Array.isArray(state.exercises) ? state : null;
    } catch { return null; }
  }

  private clearTimer(): void { if (this.timer) clearInterval(this.timer); this.timer = undefined; }
}