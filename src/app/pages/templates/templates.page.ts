import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FlowPlanService } from '../../services/flow-plan.service';

@Component({ selector: 'app-templates', standalone: true, imports: [CommonModule, IonicModule, RouterModule], templateUrl: './templates.page.html', styleUrls: ['./templates.page.scss'] })
export class TemplatesPage {
  readonly flowPlanService = inject(FlowPlanService);
  get flows() { return this.flowPlanService.savedFlows; }
  deleteFlow(id: string): void { this.flowPlanService.deleteSavedFlow(id); }
}