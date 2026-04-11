import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { GuidanceResult, ConditionResult } from '../../models';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit {
  guidance: GuidanceResult | null = null;

  constructor(private safetyService: SafetyService, private router: Router) {}

  ngOnInit() {
    this.refreshGuidance();
  }

  ionViewWillEnter() {
    // Ionic may keep this page alive in the router outlet; refresh every time it becomes active.
    this.refreshGuidance();
  }

  private refreshGuidance() {
    this.guidance = this.safetyService.getGuidance();
  }

  get hasResults() {
    return !!this.guidance?.conditionResults.length;
  }

  conditionHints: Record<string, string> = {
    pregnancy: 'Pregnancy guidance varies by trimester. Select your trimester to get the most relevant modifications.',
    postpartum: 'Postpartum work should start gently and rebuild pelvic floor and core support with low-load, slow movement.',
    balance_issues: 'Choose grounded movement and avoid unsupported balance challenges until strength improves.',
    joint_replacement: 'Use low-impact, controlled exercises and avoid high joint loads around replaced hips, knees, or shoulders.',
    foot_ankle_issues: 'Reduce foot loading, keep the feet supported, and avoid forced plantarflexion or unstable ankle positions.',
    chronic_fatigue: 'Keep sessions short, use frequent rest, and avoid pushing through excessive fatigue.'
  };

  get selectedConditionLabels() {
    return this.guidance?.conditionResults?.map(result => result.conditionLabel) ?? [];
  }

  get conditionOverview() {
    if (!this.guidance?.conditionResults?.length) {
      return '';
    }
    return this.guidance.conditionResults
      .map(result => `${result.conditionLabel}: ${result.conditionDescription}`)
      .join(' ');
  }

  get selectedConditionHints() {
    const conditionIds = this.guidance?.conditionResults?.map(result => result.conditionId) ?? [];
    return Array.from(new Set(conditionIds.map(id => this.conditionHints[id]).filter(Boolean)));
  }

  formatExerciseLabel(exerciseId: string): string {
    return exerciseId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  viewAgain() {
    this.router.navigate(['/safety-checker']);
  }
}
