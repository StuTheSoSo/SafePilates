import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import { RevenueCatService } from '../../services/revenueCat.service';

const EMAIL_KEY = 'pilatesafe-user-email';

interface ThemeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule, PremiumBannerComponent],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  private router = inject(Router);
  private revenueCatService = inject(RevenueCatService);
  private toastCtrl = inject(ToastController);

  themeOptions: ThemeOption[] = [
    { label: 'Rose (feminine)', value: 'theme-rose' },
    { label: 'Lilac (feminine)', value: 'theme-lilac' },
    { label: 'Ocean (subtle)', value: 'theme-ocean' },
    { label: 'Sage (subtle)', value: 'theme-sage' },
  ];
  selectedTheme = this.normalizeTheme(localStorage.getItem('pilatesafe-theme')) || 'theme-rose';

  savedEmail = localStorage.getItem(EMAIL_KEY) ?? '';
  emailInput = this.savedEmail;
  isSavingEmail = false;

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

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }

  async saveEmail() {
    const email = this.emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      const toast = await this.toastCtrl.create({ message: 'Please enter a valid email address.', duration: 2500, color: 'warning' });
      await toast.present();
      return;
    }
    this.isSavingEmail = true;
    try {
      await this.revenueCatService.init();
      await this.revenueCatService.logIn(email);
      localStorage.setItem(EMAIL_KEY, email);
      this.savedEmail = email;
      const toast = await this.toastCtrl.create({ message: 'Account email saved.', duration: 2000, color: 'success' });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({ message: 'Could not save email. Try again later.', duration: 2500, color: 'danger' });
      await toast.present();
    } finally {
      this.isSavingEmail = false;
    }
  }
}
