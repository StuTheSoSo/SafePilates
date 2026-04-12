import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Condition, Exercise } from '../../models';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };
import safetyConditionsData from '../../../assets/data/safety-conditions.json' with { type: 'json' };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  exercises: Exercise[] = [];
  allExercises: Exercise[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  featuredSections = [
    { title: 'Warm-up & Cool down', category: 'Warm-up / Cool down' },
    { title: 'Classical Reformer', category: 'Reformer' },
    { title: 'Chair Essentials', category: 'Chair' }
  ];
  conditions: Condition[] = [];
  selectedIds = new Set<string>();
  pregnancyTrimester = '1st';
  otherText = '';
  loading = false;
  initFailed = false;
  showSafetyOverlay = true;

  private router = inject(Router);
  private safetyService = inject(SafetyService);

  async ngOnInit() {
    // Show disclaimer overlay each app start.
    this.showSafetyOverlay = true;

    // Render immediately from bundled JSON — no async needed for first paint.
    this.conditions = safetyConditionsData as Condition[];
    this.allExercises = exercisesData as Exercise[];
    this.categories = this.getCategories(this.allExercises);
    this.categories.unshift('All');
    this.applyFilter();

    // Refresh from service in background.
    await this.loadExercises();
  }

  async ionViewWillEnter() {
    await this.loadExercises();
  }

  private async loadExercises() {
    this.initFailed = false;

    try {
      await this.safetyService.initData();
      const serviceConditions = this.safetyService.getConditions();
      if (serviceConditions.length) {
        this.conditions = serviceConditions;
      }
      this.initFailed = this.conditions.length === 0;
    } catch {
      // Bundled data already shown — no-op
    }

    const loadedAll = this.safetyService.getExercises();
    if (loadedAll.length) {
      this.allExercises = loadedAll;
    }
    this.categories = this.getCategories(this.allExercises);
    if (!this.categories.includes('All')) {
      this.categories.unshift('All');
    }
    this.applyFilter();
  }

  private getCategories(exercises: Exercise[]) {
    return Array.from(new Set(exercises.map(exercise => exercise.category ?? 'Mat'))).sort();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  private applyFilter() {
    const filtered = this.selectedCategory === 'All'
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);
    this.exercises = filtered.slice(0, 4);
  }

  get previewLabel() {
    return this.selectedCategory === 'All'
      ? 'Exercise library preview'
      : `${this.selectedCategory} exercise preview`;
  }

  get selectedCount() {
    return this.selectedIds.size;
  }

  get hasNoConditions() {
    return !this.loading && this.initFailed;
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
    return this.selectedIds.size > 0 && (!this.hasOther || this.otherText.trim().length > 0);
  }

  async submit() {
    if (!this.canSubmit) {
      return;
    }

    const otherTextLower = this.otherText.trim().toLowerCase();
    if (this.hasOther && !this.selectedIds.has('pregnancy') && /(pregnanc|pregenanc|pregnan)/.test(otherTextLower)) {
      this.selectedIds.delete('other');
      this.selectedIds.add('pregnancy');
    }

    this.loading = true;
    try {
      await this.safetyService.fetchGuidance({
        conditionIds: this.selectedConditions,
        pregnancyTrimester: this.selectedIds.has('pregnancy') ? this.pregnancyTrimester : undefined,
        otherText: this.otherText.trim()
      });
    } catch (error) {
      console.error('Guidance request failed', error);
      this.safetyService.setErrorGuidance(
        'Unable to retrieve guidance right now. Please try again later or check your connection.'
      );
    } finally {
      this.loading = false;
      this.router.navigate(['/results']);
    }
  }

  closeSafetyOverlay() {
    this.showSafetyOverlay = false;
  }

  getFeaturedExercises(category: string): Exercise[] {
    return this.allExercises.filter(exercise => exercise.category === category).slice(0, 4);
  }

  goToCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  openExercise(id: string) {
    this.router.navigateByUrl(`/exercise/${id}`);
  }
}
