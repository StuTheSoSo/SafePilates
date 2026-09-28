import { Injectable } from '@angular/core';

export const SAFETY_NOTICE_VERSION = '2026-09-25';
export const SAFETY_ACKNOWLEDGMENT_KEY = 'pilatesafe-safety-acknowledgment';

@Injectable({ providedIn: 'root' })
export class SafetyNoticeService {
  readonly version = SAFETY_NOTICE_VERSION;

  get acknowledged(): boolean {
    try {
      const record = JSON.parse(localStorage.getItem(SAFETY_ACKNOWLEDGMENT_KEY) ?? 'null');
      return record?.version === this.version && typeof record?.acknowledgedAt === 'string' && Number.isFinite(Date.parse(record.acknowledgedAt));
    } catch {
      return false;
    }
  }

  acknowledge(): boolean {
    localStorage.setItem(SAFETY_ACKNOWLEDGMENT_KEY, JSON.stringify({ version: this.version, acknowledgedAt: new Date().toISOString() }));
    return this.acknowledged;
  }
}