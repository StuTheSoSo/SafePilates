import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import { RevenueCatService } from '../../services/revenueCat.service';
import { SafetyService } from '../../services/safety.service';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

const EMAIL_KEY = 'pilatesafe-user-email';

interface ThemeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule, PremiumBannerComponent, TranslatePipe],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  private router = inject(Router);
  private revenueCatService = inject(RevenueCatService);
  private toastCtrl = inject(ToastController);
  readonly languageService = inject(LanguageService);
  private safetyService = inject(SafetyService);
  private translate = inject(TranslateService);

  themeOptions: ThemeOption[] = [
    { label: 'SETTINGS.THEME_ROSE', value: 'theme-rose' },
    { label: 'SETTINGS.THEME_LILAC', value: 'theme-lilac' },
    { label: 'SETTINGS.THEME_OCEAN', value: 'theme-ocean' },
    { label: 'SETTINGS.THEME_SAGE', value: 'theme-sage' },
  ];
  selectedTheme = this.normalizeTheme(localStorage.getItem('pilatesafe-theme')) || 'theme-rose';

  savedEmail = localStorage.getItem(EMAIL_KEY) ?? '';
  emailInput = this.savedEmail;
  isSavingEmail = false;
  readonly appVersion = '1.10';
  readonly appBuild = '20';

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

  get hasPremiumAccess(): boolean {
    return this.safetyService.isPremiumActive();
  }

  get freeConditionCount(): number {
    return this.safetyService.getFreeConditions().length;
  }

  get totalConditionCount(): number {
    return this.safetyService.getConditions().length;
  }

  get conditionUnlockProgress(): number {
    const total = this.totalConditionCount;
    if (total === 0) return 0;
    const unlocked = this.hasPremiumAccess ? total : this.freeConditionCount;
    return Math.round((unlocked / total) * 100);
  }

  async onLanguageChange(code: string): Promise<void> {
    await this.languageService.setLanguage(code);
  }

  async saveEmail() {
    const email = this.emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      const toast = await this.toastCtrl.create({ message: this.translate.instant('SETTINGS.EMAIL_INVALID'), duration: 2500, color: 'warning' });
      await toast.present();
      return;
    }
    this.isSavingEmail = true;
    try {
      await this.revenueCatService.init();
      await this.revenueCatService.logIn(email);
      localStorage.setItem(EMAIL_KEY, email);
      this.savedEmail = email;
      const toast = await this.toastCtrl.create({ message: this.translate.instant('SETTINGS.EMAIL_SAVED_TOAST'), duration: 2000, color: 'success' });
      await toast.present();
    } catch {
      const toast = await this.toastCtrl.create({ message: this.translate.instant('SETTINGS.EMAIL_SAVE_ERROR'), duration: 2500, color: 'danger' });
      await toast.present();
    } finally {
      this.isSavingEmail = false;
    }
  }
}
