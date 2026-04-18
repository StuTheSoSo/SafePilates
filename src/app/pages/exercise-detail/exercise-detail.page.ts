import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Exercise } from '../../models';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './exercise-detail.page.html',
  styleUrls: ['./exercise-detail.page.scss']
})
export class ExerciseDetailPage implements OnInit {
  exercise: Exercise | undefined;
  conditionWarnings: Array<{ conditionId: string; conditionLabel: string; reason: string; alternative: string }> = [];
  searchText = '';
  exerciseNote = '';
  noteSaved = false;

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
      this.exerciseNote = this.safetyService.getExerciseNote(id);
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
    const keywords = ['avoid', 'modify', 'alternative', 'pregnancy', 'osteoporosis', 'low back pain'];
    const searchTokens = term ? [term] : [];
    const patterns = [...new Set([...keywords, ...searchTokens])]
      .filter(token => token.trim())
      .sort((a, b) => b.length - a.length)
      .map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (!patterns.length) {
      return this.sanitizer.bypassSecurityTrustHtml(raw);
    }

    const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
    const constHighlights = raw.replace(regex, '<span class="keyword-highlight">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(constHighlights);
  }

  private loadConditionWarnings(exerciseId: string) {
    this.conditionWarnings = this.safetyService.getExerciseGuidanceForSelectedConditions(exerciseId);
  }

  saveExerciseNote() {
    if (!this.exercise) {
      return;
    }
    this.safetyService.setExerciseNote(this.exercise.id, this.exerciseNote || '');
    this.noteSaved = true;
    setTimeout(() => this.noteSaved = false, 1800);
  }
}
