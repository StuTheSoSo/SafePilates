import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../../services/safety.service';
import { PremiumBannerComponent } from '../../../components/premium-banner/premium-banner.component';
import { Program, Exercise } from '../../../models';
import programsData from '../../../../assets/data/programs.json' with { type: 'json' };

@Component({
  selector: 'app-program-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PremiumBannerComponent],
  templateUrl: './program-detail.page.html',
  styleUrls: ['./program-detail.page.scss']
})
export class ProgramDetailPage implements OnInit {
  program: Program | undefined;
  exercises: Exercise[] = [];
  exercisesWithRoles: Array<{ exercise: Exercise; role?: string }> = [];
  programNote = '';
  noteSaved = false;
  searchText = '';
  activeConditionIds: string[] = [];

  hasPremium = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    this.hasPremium = this.safetyService.isPremiumActive();
    await this.safetyService.initData();
    this.syncSearchText();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.program = (programsData as Program[]).find(p => p.id === id);
      if (this.program) {
        this.exercises = this.program.exerciseIds
          .map(eid => this.safetyService.getExerciseById(eid))
          .filter((e): e is Exercise => e !== undefined);
        
        this.exercisesWithRoles = this.exercises.map(ex => ({
          exercise: ex,
          role: this.program?.exerciseRoles?.[ex.id]
        }));
        
        this.programNote = this.safetyService.getProgramNote(id);
      }
    }
  }

  ionViewWillEnter() {
    this.syncSearchText();
    this.hasPremium = this.safetyService.isPremiumActive();
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }

  private syncSearchText() {
    this.searchText = this.safetyService.librarySearchTerm?.trim() || '';
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

  getConditionModification(conditionId: string): string | undefined {
    return this.program?.conditionModifications?.[conditionId];
  }

  getRelevantModifications(): Array<{ condition: string; modification: string }> {
    if (!this.program?.conditionModifications) return [];
    
    return this.activeConditionIds
      .map(condId => {
        const mod = this.program?.conditionModifications?.[condId];
        return { condition: condId, modification: mod || '' };
      })
      .filter(item => item.modification);
  }

  highlightText(text: string | undefined): SafeHtml {
    const raw = text || '';
    const term = this.searchText.trim();
    if (!term) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(raw));
    }
    const escapedTerm = this.escapeRegExp(term);
    const highlighted = this.escapeHtml(raw).replace(new RegExp(escapedTerm, 'gi'), match => `<mark>${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  private escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, value => {
      switch (value) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return value;
      }
    });
  }

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
