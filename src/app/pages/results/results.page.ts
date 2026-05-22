import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import { GuidanceResult, ConditionResult } from '../../models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, PremiumBannerComponent, TranslatePipe],
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss']
})
export class ResultsPage implements OnInit {
  guidance: GuidanceResult | null = null;
  conditionNotes: Record<string, string> = {};
  noteSavedConditionId: string | null = null;

  private safetyService = inject(SafetyService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private cd = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  constructor() {}

  ngOnInit() {
    this.refreshGuidance();
  }

  ionViewWillEnter() {
    // Ionic may keep this page alive in the router outlet; refresh every time it becomes active.
    this.refreshGuidance();
  }

  private refreshGuidance() {
    this.guidance = this.safetyService.getGuidance();
    console.log('ResultsPage.refreshGuidance', { guidance: this.guidance });
    this.loadConditionNotes();
    this.cd.detectChanges();
  }

  private loadConditionNotes() {
    this.conditionNotes = {};
    this.guidance?.conditionResults?.forEach(condition => {
      this.conditionNotes[condition.conditionId] = this.safetyService.getConditionNote(condition.conditionId);
    });
  }

  saveConditionNote(conditionId: string) {
    this.safetyService.setConditionNote(conditionId, this.conditionNotes[conditionId] || '');
    this.noteSavedConditionId = conditionId;
    setTimeout(() => {
      if (this.noteSavedConditionId === conditionId) {
        this.noteSavedConditionId = null;
      }
    }, 1800);
  }

  get hasPremiumAccess(): boolean {
    return this.safetyService.isPremiumActive();
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }

  get hasResults() {
    return !!this.guidance?.conditionResults.length;
  }


  get selectedConditionLabels() {
    return this.guidance?.conditionResults?.map(result => result.conditionLabel) ?? [];
  }


  get actionGuidance() {
    const selected = this.guidance?.conditionResults?.flatMap(result => {
      const guidance: string[] = [];
      if (result.conditionDescription?.trim()) {
        guidance.push(result.conditionDescription.trim());
      }
      for (const item of result.contraindications.slice(0, 2)) {
        if (item.reason?.trim()) {
          guidance.push(item.reason.trim());
        }
      }
      return guidance;
    }) ?? [];

    const unique = Array.from(new Set(selected.filter(Boolean)));
    return unique.length
      ? unique.slice(0, 4)
      : [this.translate.instant('RESULTS.NO_RESULTS')];
  }


  getConditionSection(section: 'what' | 'dangers' | 'avoid', condition: ConditionResult) {
    const description = condition.conditionDescription?.trim();
    if (section === 'what') {
      return description || this.translate.instant('RESULTS.NO_RESULTS');
    }

    if (section === 'dangers') {
      return condition.contraindications[0]?.reason
        || condition.instructorNote
        || description
        || this.translate.instant('RESULTS.NO_MODIFICATIONS');
    }

    if (section === 'avoid') {
      if (condition.contraindications.length) {
        return condition.contraindications
          .map(item => item.reason)
          .filter(Boolean)
          .slice(0, 3)
          .join(' ');
      }
      return description || this.translate.instant('RESULTS.NO_MODIFICATIONS');
    }

    return this.translate.instant('RESULTS.NO_RESULTS');
  }

  getHighlightedText(text: string): SafeHtml {
    const term = this.guidance?.searchTerm?.trim();
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }
    const escapedTerm = this.escapeRegExp(term);
    const highlighted = this.escapeHtml(text).replace(new RegExp(escapedTerm, 'gi'), match => `<mark>${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeHtml(text: string): string {
    return text.replace(/[&<>"]+/g, value => {
      switch (value) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        default: return value;
      }
    });
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getAvoidedExercises(condition: ConditionResult): string {
    const labels = condition.contraindications?.map(item => this.formatExerciseLabel(item.exerciseId)).filter(Boolean) || [];
    return labels.join(', ') || this.translate.instant('RESULTS.NO_MODIFICATIONS');
  }

  formatExerciseLabel(exerciseId: string): string {
    const translatedExercise = this.safetyService.getExerciseById(exerciseId);
    if (translatedExercise?.name?.trim()) {
      return translatedExercise.name;
    }
    return exerciseId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  viewAgain() {
    this.router.navigate(['/']);
  }
}
