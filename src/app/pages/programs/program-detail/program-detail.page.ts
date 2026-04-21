import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../../services/safety.service';
import { Program, Exercise } from '../../../models';
import programsData from '../../../../assets/data/programs.json' with { type: 'json' };

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './program-detail.page.html',
  styleUrls: ['./program-detail.page.scss']
})
export class ProgramDetailPage implements OnInit {
  program: Program | undefined;
  exercises: Exercise[] = [];
  programNote = '';
  noteSaved = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private safetyService = inject(SafetyService);

  async ngOnInit() {
    await this.safetyService.initData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.program = (programsData as Program[]).find(p => p.id === id);
      if (this.program) {
        this.exercises = this.program.exerciseIds
          .map(eid => this.safetyService.getExerciseById(eid))
          .filter((e): e is Exercise => e !== undefined);
        this.programNote = this.safetyService.getProgramNote(id);
      }
    }
  }

  saveProgramNote() {
    if (!this.program) {
      return;
    }
    this.safetyService.setProgramNote(this.program.id, this.programNote || '');
    this.noteSaved = true;
    setTimeout(() => this.noteSaved = false, 1800);
  }

  openExercise(id: string) {
    this.router.navigate(['/exercise', id]);
  }

  levelColor(level: string): string {
    switch (level) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'medium';
    }
  }
}
