import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import { Program } from '../../models';
import programsData from '../../../assets/data/programs.json' with { type: 'json' };
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PremiumBannerComponent, TranslatePipe],
  templateUrl: './programs.page.html',
  styleUrls: ['./programs.page.scss']
})
export class ProgramsPage implements OnInit {
  programs: Program[] = [];
  filteredPrograms: Program[] = [];
  searchText = '';
  programNotes: Record<string, string> = {};
  noteSavedProgramId: string | null = null;
  private router = inject(Router);
  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await this.safetyService.initData();
    const loaded = this.safetyService.getPrograms();
    this.programs = (loaded.length ? [...loaded] : [...(programsData as Program[])]).sort((a, b) => a.name.localeCompare(b.name));
    this.searchText = this.safetyService.librarySearchTerm || '';
    this.loadProgramNotes();
    this.filterPrograms();
  }

  ionViewWillEnter() {
    const loaded = this.safetyService.getPrograms();
    if (loaded.length) {
      this.programs = [...loaded].sort((a, b) => a.name.localeCompare(b.name));
      this.filterPrograms();
    }
    this.loadProgramNotes();
  }

  private loadProgramNotes() {
    this.programNotes = this.programs.reduce((notes, program) => {
      notes[program.id] = this.safetyService.getProgramNote(program.id);
      return notes;
    }, {} as Record<string, string>);
  }

  private filterPrograms() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredPrograms = this.programs;
      return;
    }

    this.filteredPrograms = this.programs.filter(program => this.programMatchesSearch(program, term));
  }

  private programMatchesSearch(program: Program, term: string) {
    const haystack = [program.name, program.goal, program.description, ...(program.focusAreas ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(term);
  }

  onSearchTextChange(event: CustomEvent) {
    this.searchText = event.detail.value || '';
    this.safetyService.librarySearchTerm = this.searchText.trim();
    this.filterPrograms();
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

  displayLevel(level: string): string {
    const normalized = (level || '').toLowerCase();
    if (normalized === 'beginner') {
      return this.translate.instant('EXERCISE_DETAIL.BEGINNER').replace(/[：:]\s*$/, '');
    }
    if (normalized === 'intermediate') {
      return this.translate.instant('EXERCISE_DETAIL.INTERMEDIATE').replace(/[：:]\s*$/, '');
    }
    if (normalized === 'advanced') {
      return this.translate.instant('EXERCISE_DETAIL.ADVANCED').replace(/[：:]\s*$/, '');
    }
    return level;
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }

  get hasPremiumAccess(): boolean {
    return this.safetyService.isPremiumActive();
  }

  getFirstExerciseName(program: Program): string {
    if (!program.exerciseIds?.length) return '';
    const ex = this.safetyService.getExerciseById(program.exerciseIds[0]);
    return ex?.name ?? '';
  }
}
