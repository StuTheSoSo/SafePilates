import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
  filteredPrograms: Program[] = [];
  searchText = '';
  programNotes: Record<string, string> = {};
  noteSavedProgramId: string | null = null;
  private router = inject(Router);
  private safetyService = inject(SafetyService);
  private sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.programs = [...(programsData as Program[])].sort((a, b) => a.name.localeCompare(b.name));
    this.searchText = this.safetyService.librarySearchTerm || '';
    this.loadProgramNotes();
    this.filterPrograms();
  }

  ionViewWillEnter() {
    this.loadProgramNotes();
    this.filterPrograms();
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
}
