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
  private router = inject(Router);

  constructor(private safetyService: SafetyService) {}

  async ngOnInit() {
    this.exercises = exercisesData as Exercise[];
    await this.loadExercises();
  }

  async ionViewWillEnter() {
    await this.loadExercises();
  }

  private async loadExercises() {
    await this.safetyService.initData();
    const loaded = this.safetyService.getExercises();
    if (loaded.length) {
      this.exercises = loaded;
    }
  }

  openExercise(id: string) {
    this.router.navigateByUrl(`/exercise/${id}`);
  }
}
