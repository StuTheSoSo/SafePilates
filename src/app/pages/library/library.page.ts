import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Exercise } from '../../models';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './library.page.html',
  styleUrls: ['./library.page.scss']
})
export class LibraryPage implements OnInit {
  exercises: Exercise[] = [];
  allExercises: Exercise[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  private router = inject(Router);
  private safetyService = inject(SafetyService);

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

  private applyFilter() {
    this.exercises = this.selectedCategory === 'All'
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);
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
    this.router.navigateByUrl(`/exercise/${id}`);
  }
}
