import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface ThemeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  themeOptions: ThemeOption[] = [
    { label: 'Rose (feminine)', value: 'theme-rose' },
    { label: 'Lilac (feminine)', value: 'theme-lilac' },
    { label: 'Ocean (subtle)', value: 'theme-ocean' },
    { label: 'Sage (subtle)', value: 'theme-sage' },
  ];
  selectedTheme = this.normalizeTheme(localStorage.getItem('pilatesafe-theme')) || 'theme-rose';

  constructor() {
    this.applyTheme(this.selectedTheme);
  }

  onThemeChange(event: any) {
    const theme = event.detail ? event.detail.value : event;
    this.selectedTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('pilatesafe-theme', theme);
  }

  private normalizeTheme(value: string | null): string | null {
    if (!value) {
      return null;
    }

    // Migrate legacy theme names.
    const legacyMap: Record<string, string> = {
      'theme-blush': 'theme-rose',
      'theme-lavender': 'theme-lilac',
      'theme-sky': 'theme-ocean',
      'theme-teal': 'theme-sage',
      'theme-slate': 'theme-sage'
    };
    const mapped = legacyMap[value] || value;

    const allowed = new Set(this.themeOptions.map(t => t.value));
    return allowed.has(mapped) ? mapped : null;
  }

  applyTheme(theme: string) {
    document.documentElement.classList.remove(...this.themeOptions.map(t => t.value));
    document.documentElement.classList.add(theme);
  }
}
