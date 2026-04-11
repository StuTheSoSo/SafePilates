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
  private readonly themeStorageKey = 'safepilates-theme';
  private readonly defaultTheme = 'theme-blush';

  tabs = [
    { label: 'Home', icon: 'home-outline', route: '/' },
    { label: 'Safety', icon: 'shield-checkmark-outline', route: '/safety-checker' },
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
    const theme = localStorage.getItem(this.themeStorageKey) || this.defaultTheme;
    document.documentElement.classList.add(theme);
  }
}
