import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { FlowRunnerService } from '../../services/flow-runner.service';
import { FlowPlanService } from '../../services/flow-plan.service';

@Component({ selector: 'app-run', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './run.page.html', styleUrls: ['./run.page.scss'] })
export class RunPage implements OnInit, OnDestroy {
  readonly runner = inject(FlowRunnerService);
  private readonly planService = inject(FlowPlanService);
  private readonly router = inject(Router);
  private subscription?: Subscription;
  status = this.runner.state.status;

  ngOnInit(): void {
    if (!this.runner.state.exercises.length && this.planService.currentPlan.segments.some(segment => segment.items.length)) this.runner.loadPlan(this.planService.currentPlan);
    this.subscription = this.runner.state$.subscribe(state => this.status = state.status);
  }
  ngOnDestroy(): void { this.subscription?.unsubscribe(); }
  backToPlanner(): void { this.runner.pause(); this.router.navigateByUrl('/planner'); }
}