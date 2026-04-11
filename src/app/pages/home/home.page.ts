import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Exercise } from '../../models';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
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

  getFeaturedExercises(category: string): Exercise[] {
    return this.allExercises.filter(exercise => exercise.category === category).slice(0, 4);
  }

  goToCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  goToSafetyChecker() {
    this.router.navigateByUrl('/safety-checker');
  }

  openExercise(id: string) {
    this.router.navigateByUrl(`/exercise/${id}`);
  }
}
