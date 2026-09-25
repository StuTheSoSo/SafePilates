import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RevenueCatService } from './services/revenueCat.service';
import { LanguageService } from './services/language.service';
import { WatchBridgeService } from './watch/watch-bridge.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  private revenueCatService = inject(RevenueCatService);
  private languageService = inject(LanguageService);
  private watchBridge = inject(WatchBridgeService);
  private readonly themeStorageKey = 'pilatesafe-theme';
  private readonly defaultTheme = 'theme-rose';
  private readonly allowedThemes = new Set(['theme-rose', 'theme-lilac', 'theme-ocean', 'theme-sage']);

  tabs = [
    { label: 'TABS.HOME',     icon: 'home-outline',      route: '/' },
    { label: 'TABS.PLANNER',  icon: 'create-outline',    route: '/planner' },
    { label: 'TABS.LIBRARY',  icon: 'library-outline',   route: '/library' },
    { label: 'TABS.PROGRAMS', icon: 'list-outline',      route: '/programs' },
    { label: 'TABS.CLIENTS',  icon: 'people-outline',    route: '/clients' },
    { label: 'TABS.SETTINGS', icon: 'settings-outline',  route: '/settings' },
  ];

  constructor() {
    this.applySavedTheme();
    this.revenueCatService.init();
    this.languageService.init();
    this.watchBridge.initialize();
  }

  get currentRoute() {
    return this.router.url || '/';
  }

  isTabActive(route: string): boolean {
    const url = this.router.url || '/';
    if (route === '/') return url === '/';
    return url === route || url.startsWith(route + '/');
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
