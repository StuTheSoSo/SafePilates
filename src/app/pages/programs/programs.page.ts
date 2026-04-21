import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Program } from '../../models';
import programsData from '../../../assets/data/programs.json' with { type: 'json' };

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './programs.page.html',
  styleUrls: ['./programs.page.scss']
})
export class ProgramsPage implements OnInit {
  programs: Program[] = [];
  programNotes: Record<string, string> = {};
  noteSavedProgramId: string | null = null;
  private router = inject(Router);
  private safetyService = inject(SafetyService);

  ngOnInit() {
    this.programs = programsData as Program[];
    this.loadProgramNotes();
  }

  ionViewWillEnter() {
    this.loadProgramNotes();
  }

  private loadProgramNotes() {
    this.programNotes = this.programs.reduce((notes, program) => {
      notes[program.id] = this.safetyService.getProgramNote(program.id);
      return notes;
    }, {} as Record<string, string>);
  }

  openProgram(id: string) {
    this.router.navigate(['/programs', id]);
  }

  saveProgramNote(programId: string) {
    const note = this.programNotes[programId] || '';
    this.safetyService.setProgramNote(programId, note);
    this.noteSavedProgramId = programId;
    setTimeout(() => {
      if (this.noteSavedProgramId === programId) {
        this.noteSavedProgramId = null;
      }
    }, 1800);
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
