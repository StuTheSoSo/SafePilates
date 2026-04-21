import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Program } from '../../models';
import programsData from '../../../assets/data/programs.json' with { type: 'json' };

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './programs.page.html',
  styleUrls: ['./programs.page.scss']
})
export class ProgramsPage implements OnInit {
  programs: Program[] = [];
  private router = inject(Router);

  ngOnInit() {
    this.programs = programsData as Program[];
  }

  openProgram(id: string) {
    this.router.navigate(['/programs', id]);
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
