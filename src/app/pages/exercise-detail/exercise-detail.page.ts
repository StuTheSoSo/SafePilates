import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Exercise } from '../../models';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './exercise-detail.page.html',
  styleUrls: ['./exercise-detail.page.scss']
})
export class ExerciseDetailPage implements OnInit {
  exercise: Exercise | undefined;
  conditionWarnings: Array<{ conditionId: string; conditionLabel: string; reason: string; alternative: string }> = [];
  searchText = '';

  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);

  constructor(private route: ActivatedRoute) {}

  get teachingCues(): string[] {
    if (!this.exercise) {
      return [];
    }

    const cues = [...(this.exercise.teachingCues ?? [])];
    if (this.exercise.selfCheck) {
      cues.push(this.exercise.selfCheck);
    }
    if (!cues.length && this.exercise.safetyNote) {
      cues.push(this.exercise.safetyNote);
    }
    return cues;
  }

  isArray(value: unknown): value is string[] {
    return Array.isArray(value);
  }

  async ngOnInit() {
    await this.safetyService.initData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.exercise = this.safetyService.getExerciseById(id);
      this.loadConditionWarnings(id);
    }

    this.syncSearchText();
  }

  ionViewWillEnter() {
    // Called every time Ionic makes this page active — reliable even when component is cached.
    this.syncSearchText();
  }

  private syncSearchText() {
    this.searchText = this.safetyService.librarySearchTerm?.trim()
      || this.route.snapshot.queryParamMap.get('search')?.trim()
      || '';
  }

  highlightText(text: string | undefined): SafeHtml {
    const raw = text || '';
    const term = this.searchText.trim();
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(raw);
    }

    const escapedQuery = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlighted = raw.replace(regex, '<span class="highlight">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private loadConditionWarnings(exerciseId: string) {
    this.conditionWarnings = this.safetyService.getExerciseGuidanceForSelectedConditions(exerciseId);
  }
}
