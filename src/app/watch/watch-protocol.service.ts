import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FlowRunnerService } from '../services/flow-runner.service';
import { SafetyService } from '../services/safety.service';
import { WatchCommandAck, WatchCommandMessage, WatchCommandRejection, WatchStateMessage, WATCH_PROTOCOL_VERSION, isWatchCommandMessage, watchExercise } from './watch-protocol';

@Injectable({ providedIn: 'root' })
export class WatchProtocolService implements OnDestroy {
  private readonly stateSubject = new BehaviorSubject<WatchStateMessage | null>(null);
  readonly state$ = this.stateSubject.asObservable();
  private readonly processedMessageIds = new Set<string>();
  private subscription: Subscription;

  constructor(private readonly runner: FlowRunnerService, private readonly safety: SafetyService) {
    this.subscription = this.runner.state$.subscribe(() => this.publishState());
    void this.safety.initData().then(() => this.publishState());
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  get latestState(): WatchStateMessage | null { return this.stateSubject.value; }

  handleCommand(candidate: unknown): WatchCommandAck {
    if (!isWatchCommandMessage(candidate)) return this.reject('', '', 'invalid-message');
    if (candidate.protocolVersion !== WATCH_PROTOCOL_VERSION) return this.reject(candidate.sessionId, candidate.messageId, 'unsupported-protocol');
    if (candidate.sessionId !== this.runner.currentSessionId) return this.reject(candidate.sessionId, candidate.messageId, 'unknown-session');
    if (this.processedMessageIds.has(candidate.messageId)) return this.reject(candidate.sessionId, candidate.messageId, 'duplicate-command');
    if (candidate.command !== 'requestState' && candidate.baseRevision !== undefined && candidate.baseRevision !== this.runner.currentRevision) return this.reject(candidate.sessionId, candidate.messageId, 'stale-command');
    if (!this.canApply(candidate)) return this.reject(candidate.sessionId, candidate.messageId, 'invalid-state');
    this.processedMessageIds.add(candidate.messageId);
    switch (candidate.command) { case 'start': case 'resume': this.runner.start(); break; case 'pause': this.runner.pause(); break; case 'next': this.runner.next(); break; case 'previous': this.runner.previous(); break; case 'stop': this.runner.stop(); break; case 'requestState': break; }
    this.publishState();
    return this.ack(candidate.sessionId, candidate.messageId, true);
  }

  private publishState(): void {
    const state = this.runner.state;
    if (!state.exercises.length) {
      const now = new Date().toISOString();
      this.stateSubject.next({ type: 'runner.state', protocolVersion: WATCH_PROTOCOL_VERSION, sessionId: this.runner.currentSessionId, revision: this.runner.currentRevision, sentAt: now, updatedAt: now, status: 'ready', currentIndex: 0, totalExercises: 0, className: '', appearance: this.watchAppearance() });
      return;
    }
    const current = this.runner.current;
    const now = new Date().toISOString();
    this.stateSubject.next({ type: 'runner.state', protocolVersion: WATCH_PROTOCOL_VERSION, sessionId: this.runner.currentSessionId, revision: this.runner.currentRevision, sentAt: now, updatedAt: now, currentExerciseEndsAt: this.runner.currentExerciseEndsAt, status: state.status, currentIndex: state.currentIndex, totalExercises: state.exercises.length, currentExercise: watchExercise(current, this.exerciseName(current?.exerciseId), this.runner.remainingSeconds), nextExercise: watchExercise(state.exercises[state.currentIndex + 1], this.exerciseName(state.exercises[state.currentIndex + 1]?.exerciseId), undefined), className: state.plan.name, appearance: this.watchAppearance() });
  }

  private exerciseName(exerciseId: string | undefined): string {
    return exerciseId ? this.safety.getExerciseById(exerciseId)?.name ?? exerciseId : '';
  }

  private watchAppearance() {
    return { accent: '#ed6b9c', background: '#f7faf9', text: '#173c35', secondaryText: '#436055', timerNormal: '#000000', timerWarning: '#a8631f', timerDanger: '#a53d50' };
  }

  private canApply(message: WatchCommandMessage): boolean {
    const status = this.runner.state.status;
    if (message.command === 'start' || message.command === 'resume') return this.runner.safety.acknowledged && ['ready', 'setup', 'paused'].includes(status);
    if (message.command === 'pause') return status === 'running';
    return message.command === 'requestState' || status !== 'completed';
  }

  private ack(sessionId: string, messageId: string, accepted: boolean, reason?: WatchCommandRejection): WatchCommandAck { return { type: 'runner.commandAck', protocolVersion: WATCH_PROTOCOL_VERSION, sessionId, messageId, accepted, revision: this.runner.currentRevision, sentAt: new Date().toISOString(), reason }; }
  private reject(sessionId: string, messageId: string, reason: WatchCommandRejection): WatchCommandAck { this.publishState(); return this.ack(sessionId, messageId, false, reason); }
}