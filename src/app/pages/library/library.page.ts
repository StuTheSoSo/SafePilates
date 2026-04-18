import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Exercise } from '../../models';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss']
})
export class LibraryPage implements OnInit {
  exercises: Exercise[] = [];
  allExercises: Exercise[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  searchText = '';
  private router = inject(Router);
  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    this.allExercises = exercisesData as Exercise[];
    this.categories = this.getCategories(this.allExercises);
    this.categories.unshift('All');
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

  onSearchTextChange(event: CustomEvent) {
    this.searchText = event.detail.value || '';
    this.safetyService.librarySearchTerm = this.searchText.trim();
  }

  private applyFilter() {
    this.exercises = this.selectedCategory === 'All'
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);
  }

  get filteredExercises() {
    const term = this.searchText.trim().toLowerCase();
    const categoryFiltered = this.selectedCategory === 'All'
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
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(raw);
    }

    const escapedQuery = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const highlighted = raw.replace(regex, '<span class="highlight">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  get libraryWarnings() {
    return this.allExercises
      .map(exercise => {
        const issues: string[] = [];
        if (!exercise.focus?.trim()) {
          issues.push('missing focus');
        }
        if (!exercise.category?.trim()) {
          issues.push('missing category');
        }
        return issues.length ? { name: exercise.name, issues } : null;
      })
      .filter(Boolean) as { name: string; issues: string[] }[];
  }

  openExercise(id: string) {
    const search = this.searchText.trim();
    this.safetyService.librarySearchTerm = search;
    this.router.navigate([`/exercise/${id}`], {
      queryParams: {
        search: search || undefined
      },
      state: search ? { search } : undefined
    });
  }
}
