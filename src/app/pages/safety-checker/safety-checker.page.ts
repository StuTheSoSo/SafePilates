import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Condition } from '../../models';

@Component({
  selector: 'app-safety-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './safety-checker.page.html',
  styleUrls: ['./safety-checker.page.scss']
})
export class SafetyCheckerPage implements OnInit {
  conditions: Condition[] = [];
  selectedIds = new Set<string>();
  pregnancyTrimester = '1st';
  otherText = '';
  loading = false;
  initFailed = false;

  constructor(private safetyService: SafetyService, private router: Router) {}

  async ngOnInit() {
    this.loading = true;
    try {
      await this.safetyService.initData();
      this.conditions = this.safetyService.getConditions();
      this.initFailed = this.conditions.length === 0;
    } finally {
      this.loading = false;
    }
  }

  get selectedCount() {
    return this.selectedIds.size;
  }

  get hasNoConditions() {
    return !this.loading && this.conditions.length === 0;
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  toggleCondition(conditionId: string) {
    if (this.selectedIds.has(conditionId)) {
      this.selectedIds.delete(conditionId);
    } else {
      this.selectedIds.add(conditionId);
    }
  }

  get selectedConditions() {
    return Array.from(this.selectedIds);
  }

  get hasOther() {
    return this.selectedIds.has('other');
  }

  get canSubmit() {
    return this.selectedIds.size > 0;
  }

  async submit() {
    if (!this.canSubmit) {
      return;
    }

    this.loading = true;
    await this.safetyService.fetchGuidance({
      conditionIds: this.selectedConditions,
      pregnancyTrimester: this.selectedIds.has('pregnancy') ? this.pregnancyTrimester : undefined,
      otherText: this.otherText
    });
    this.loading = false;
    this.router.navigate(['/results']);
  }
}
