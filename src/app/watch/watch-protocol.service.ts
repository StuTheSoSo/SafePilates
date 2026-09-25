import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FlowRunnerService } from '../services/flow-runner.service';
import { WatchCommandAck, WatchCommandMessage, WatchCommandRejection, WatchStateMessage, WATCH_PROTOCOL_VERSION, isWatchCommandMessage, watchExercise } from './watch-protocol';

@Injectable({ providedIn: 'root' })
export class WatchProtocolService {
  private readonly stateSubject = new BehaviorSubject<WatchStateMessage | null>(null);
  readonly state$ = this.stateSubject.asObservable();
  private readonly processedMessageIds = new Set<string>();
  private readonly sessionId = `pilatesafe-${Date.now().toString(36)}`;
  private revision = 0;
  private subscription: Subscription;

  constructor(private readonly runner: FlowRunnerService) {
    this.subscription = this.runner.state$.subscribe(() => this.publishState());
  }

  get latestState(): WatchStateMessage | null { return this.stateSubject.value; }

  handleCommand(candidate: unknown): WatchCommandAck {
    if (!isWatchCommandMessage(candidate)) return this.reject('', '', 'invalid-message');
    if (candidate.protocolVersion !== WATCH_PROTOCOL_VERSION) return this.reject(candidate.sessionId, candidate.messageId, 'unsupported-protocol');
    if (candidate.sessionId !== this.sessionId) return this.reject(candidate.sessionId, candidate.messageId, 'unknown-session');
    if (this.processedMessageIds.has(candidate.messageId)) return this.reject(candidate.sessionId, candidate.messageId, 'duplicate-command');
    if (!this.canApply(candidate)) return this.reject(candidate.sessionId, candidate.messageId, 'invalid-state');
    this.processedMessageIds.add(candidate.messageId);
    switch (candidate.command) { case 'start': case 'resume': this.runner.start(); break; case 'pause': this.runner.pause(); break; case 'next': this.runner.next(); break; case 'previous': this.runner.previous(); break; case 'stop': this.runner.stop(); break; case 'requestState': break; }
    this.revision++;
    this.publishState();
    return this.ack(candidate.sessionId, candidate.messageId, true);
  }

  private publishState(): void {
    const state = this.runner.state;
    if (!state.exercises.length) { this.stateSubject.next(null); return; }
    const current = this.runner.current;
    const now = new Date().toISOString();
    this.stateSubject.next({ type: 'runner.state', protocolVersion: WATCH_PROTOCOL_VERSION, sessionId: this.sessionId, revision: this.revision, sentAt: now, updatedAt: now, status: state.status, currentIndex: state.currentIndex, totalExercises: state.exercises.length, currentExercise: watchExercise(current, current?.exerciseId ?? '', this.runner.remainingSeconds), nextExercise: watchExercise(state.exercises[state.currentIndex + 1], state.exercises[state.currentIndex + 1]?.exerciseId ?? ''), className: state.plan.name });
  }

  private canApply(message: WatchCommandMessage): boolean {
    const status = this.runner.state.status;
    if (message.command === 'start' || message.command === 'resume') return ['ready', 'paused'].includes(status);
    if (message.command === 'pause') return status === 'running';
    return message.command === 'requestState' || status !== 'completed';
  }

  private ack(sessionId: string, messageId: string, accepted: boolean, reason?: WatchCommandRejection): WatchCommandAck { return { type: 'runner.commandAck', protocolVersion: WATCH_PROTOCOL_VERSION, sessionId, messageId, accepted, revision: this.revision, sentAt: new Date().toISOString(), reason }; }
  private reject(sessionId: string, messageId: string, reason: WatchCommandRejection): WatchCommandAck { this.publishState(); return this.ack(sessionId, messageId, false, reason); }
}