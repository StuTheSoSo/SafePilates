import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FlowPlanService } from '../../services/flow-plan.service';
import { SafetyService } from '../../services/safety.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {
  readonly flowPlanService = inject(FlowPlanService);
  readonly safetyService = inject(SafetyService);

  get savedFlows() {
    return this.flowPlanService.savedFlows;
  }

  startNewFlow(): void {
    this.flowPlanService.startBlankFlow();
  }
}