import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FlowPlanService } from '../../services/flow-plan.service';
import { OnboardingService } from '../../services/onboarding.service';

@Component({ selector: 'app-onboarding', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './onboarding.page.html', styleUrls: ['./onboarding.page.scss'] })
export class OnboardingPage {
  private readonly onboarding = inject(OnboardingService);
  private readonly planService = inject(FlowPlanService);
  private readonly router = inject(Router);
  readonly steps = [
    { icon: 'shield-checkmark-outline', title: 'Start with safety', body: 'Keep client conditions close while you build a thoughtful class.' },
    { icon: 'create-outline', title: 'Build your flow', body: 'Shape arrival, main work, and closing with searchable movement data.' },
    { icon: 'pulse-outline', title: 'Review the arc', body: 'Get feedback on balance, progression, breath, transitions, and principles.' },
    { icon: 'timer-outline', title: 'Teach with confidence', body: 'Run the class with a focused timer and recover your session if you leave the app.' },
  ];
  currentStepIndex = 0;
  get currentStep() { return this.steps[this.currentStepIndex]; }
  get isLastStep() { return this.currentStepIndex === this.steps.length - 1; }
  next(): void { if (!this.isLastStep) this.currentStepIndex++; }
  back(): void { if (this.currentStepIndex > 0) this.currentStepIndex--; }
  skip(): void { this.onboarding.completeOnboarding(); this.router.navigateByUrl('/'); }
  finish(path: '/planner' | '/templates' | '/library' = '/planner'): void { this.onboarding.completeOnboarding(); if (path === '/planner') this.planService.startBlankFlow(); this.router.navigateByUrl(path); }
}