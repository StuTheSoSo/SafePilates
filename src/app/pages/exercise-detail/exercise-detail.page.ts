import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  private safetyService = inject(SafetyService);

  constructor(private route: ActivatedRoute) {}

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
  }

  private loadConditionWarnings(exerciseId: string) {
    this.conditionWarnings = this.safetyService.getExerciseGuidanceForSelectedConditions(exerciseId);
  }
}
