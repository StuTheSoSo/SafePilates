import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  private readonly themeStorageKey = 'pilatesafe-theme';
  private readonly defaultTheme = 'theme-rose';
  private readonly allowedThemes = new Set(['theme-rose', 'theme-lilac', 'theme-ocean', 'theme-sage']);

  tabs = [
    { label: 'Home', icon: 'home-outline', route: '/' },
    { label: 'Library', icon: 'library-outline', route: '/library' },
    { label: 'Settings', icon: 'settings-outline', route: '/settings' },
  ];

  constructor() {
    this.applySavedTheme();
  }

  get currentRoute() {
    return this.router.url || '/';
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
  }

  private applySavedTheme() {
    const stored = localStorage.getItem(this.themeStorageKey);
    const theme = this.normalizeTheme(stored) || this.defaultTheme;
    localStorage.setItem(this.themeStorageKey, theme);
    document.documentElement.classList.add(theme);
  }

  private normalizeTheme(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const legacyMap: Record<string, string> = {
      'theme-blush': 'theme-rose',
      'theme-lavender': 'theme-lilac',
      'theme-sky': 'theme-ocean',
      'theme-teal': 'theme-sage',
      'theme-slate': 'theme-sage'
    };
    const mapped = legacyMap[value] || value;
    return this.allowedThemes.has(mapped) ? mapped : null;
  }
}
