import { Component, OnInit } from '@angular/core';
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

  constructor(private route: ActivatedRoute, private safetyService: SafetyService) {}

  async ngOnInit() {
    await this.safetyService.initData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.exercise = this.safetyService.getExerciseById(id);
    }
  }
}
