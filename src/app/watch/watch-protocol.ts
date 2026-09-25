import { RunnerStatus, RunExercise } from '../models';

export const WATCH_PROTOCOL_VERSION = 1;
export type WatchCommandName = 'start' | 'pause' | 'resume' | 'next' | 'previous' | 'stop' | 'requestState';
export type WatchCommandRejection = 'invalid-message' | 'unsupported-protocol' | 'unknown-session' | 'duplicate-command' | 'stale-command' | 'invalid-state';

export interface WatchExerciseState { id: string; exerciseId: string; name: string; remainingSeconds?: number; durationSeconds?: number; }
export interface WatchAppearance { accent: string; background: string; text: string; secondaryText: string; timerNormal: string; timerWarning: string; timerDanger: string; }
export interface WatchStateMessage { type: 'runner.state'; protocolVersion: typeof WATCH_PROTOCOL_VERSION; sessionId: string; revision: number; sentAt: string; updatedAt: string; status: RunnerStatus; currentIndex: number; totalExercises: number; currentExercise?: WatchExerciseState; nextExercise?: WatchExerciseState; className: string; appearance?: WatchAppearance; }
export interface WatchCommandMessage { type: 'runner.command'; protocolVersion: number; sessionId: string; messageId: string; sentAt: string; command: WatchCommandName; baseRevision?: number; }
export interface WatchCommandAck { type: 'runner.commandAck'; protocolVersion: typeof WATCH_PROTOCOL_VERSION; sessionId: string; messageId: string; accepted: boolean; revision: number; sentAt: string; reason?: WatchCommandRejection; }

export function isWatchCommandMessage(value: unknown): value is WatchCommandMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Partial<WatchCommandMessage>;
  return message.type === 'runner.command' && typeof message.protocolVersion === 'number' && typeof message.sessionId === 'string' && !!message.sessionId && typeof message.messageId === 'string' && !!message.messageId && typeof message.sentAt === 'string' && Number.isFinite(Date.parse(message.sentAt)) && typeof message.command === 'string' && ['start', 'pause', 'resume', 'next', 'previous', 'stop', 'requestState'].includes(message.command);
}

export function watchExercise(exercise: RunExercise | undefined, name: string, remainingSeconds?: number): WatchExerciseState | undefined {
  if (!exercise) return undefined;
  return { id: exercise.id, exerciseId: exercise.exerciseId, name, remainingSeconds, durationSeconds: remainingSeconds === undefined ? undefined : exercise.durationSeconds };
}