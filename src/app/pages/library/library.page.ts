import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import { Exercise } from '../../models';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PremiumBannerComponent, TranslatePipe],
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss']
})
export class LibraryPage implements OnInit {
  private readonly ALL_CATEGORY = '__all__';
  exercises: Exercise[] = [];
  allExercises: Exercise[] = [];
  categories: string[] = [];
  selectedCategory = this.ALL_CATEGORY;
  searchText = '';
  private router = inject(Router);
  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  async ngOnInit() {
    this.allExercises = exercisesData as Exercise[];
    this.categories = this.getCategories(this.allExercises);
    this.categories.unshift(this.ALL_CATEGORY);
    this.applyFilter();
    await this.loadExercises();
  }

  async ionViewWillEnter() {
    await this.loadExercises();
  }

  private async loadExercises() {
    await this.safetyService.initData();
    const loaded = this.safetyService.getExercises();
    if (loaded.length) {
      this.allExercises = loaded;
    }
    this.categories = this.getCategories(this.allExercises);
    if (!this.categories.includes(this.ALL_CATEGORY)) {
      this.categories.unshift(this.ALL_CATEGORY);
    }
    this.applyFilter();
  }

  displayCategory(category: string): string {
    if (category === this.ALL_CATEGORY) {
      return this.translate.instant('LIBRARY.ALL');
    }
    return category;
  }

  private getCategories(exercises: Exercise[]) {
    return Array.from(new Set(exercises.map(exercise => exercise.category ?? '')))
      .filter(category => category.trim().length > 0)
      .sort();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  onSearchTextChange(event: CustomEvent) {
    this.searchText = event.detail.value || '';
    this.safetyService.librarySearchTerm = this.searchText.trim();
  }

  private applyFilter() {
    this.exercises = this.selectedCategory === this.ALL_CATEGORY
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);
  }

  get filteredExercises() {
    const term = this.searchText.trim().toLowerCase();
    const categoryFiltered = this.selectedCategory === this.ALL_CATEGORY
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);

    if (!term) {
      return categoryFiltered;
    }

    return categoryFiltered.filter(exercise => this.exerciseMatchesSearch(exercise, term));
  }

  exerciseMatchesSearch(exercise: Exercise, term: string) {
    return [exercise.name, exercise.shortDescription, exercise.focus, exercise.category]
      .some(field => field?.toLowerCase().includes(term));
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
    const highlighted = raw.replace(regex, '<span class="keyword-highlight">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  get libraryWarnings() {
    return this.allExercises
      .map(exercise => {
        const issues: string[] = [];
        if (!exercise.focus?.trim()) {
          issues.push(this.translate.instant('LIBRARY.MISSING_FOCUS'));
        }
        if (!exercise.category?.trim()) {
          issues.push(this.translate.instant('LIBRARY.MISSING_CATEGORY'));
        }
        return issues.length ? { name: exercise.name, issues } : null;
      })
      .filter(Boolean) as { name: string; issues: string[] }[];
  }

  openExercise(id: string, exercise: Exercise) {
    const search = this.searchText.trim();
    this.safetyService.librarySearchTerm = search;

    if (this.safetyService.isExercisePremium(exercise) && !this.safetyService.isPremiumActive()) {
      this.navigateToUpgrade();
      return;
    }

    this.router.navigate([`/exercise/${id}`], {
      queryParams: {
        search: search || undefined
      },
      state: search ? { search } : undefined
    });
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }

  get hasPremiumAccess(): boolean {
    return this.safetyService.isPremiumActive();
  }
}
