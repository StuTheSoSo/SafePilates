import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subject } from 'rxjs';

export interface LocaleConfig {
  code: string;
  nativeName: string;
  rtl: boolean;
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'pilatesafe-language';
  private readonly translate = inject(TranslateService);

  /** Emits the new locale code whenever the user explicitly changes language. */
  readonly languageChange$ = new Subject<string>();

  readonly locales: LocaleConfig[] = [
    { code: 'en',      nativeName: 'English',   rtl: false },
    { code: 'es',      nativeName: 'Español',   rtl: false },
    { code: 'fr',      nativeName: 'Français',  rtl: false },
    { code: 'de',      nativeName: 'Deutsch',   rtl: false },
    { code: 'pt',      nativeName: 'Português', rtl: false },
    { code: 'it',      nativeName: 'Italiano',  rtl: false },
    { code: 'ja',      nativeName: '日本語',     rtl: false },
    { code: 'zh-Hans', nativeName: '中文',       rtl: false },
    { code: 'ar',      nativeName: 'العربية',   rtl: true  },
  ];

  readonly currentLocale = signal('en');

  async init(): Promise<void> {
    this.translate.addLangs(this.locales.map(l => l.code));
    this.translate.setDefaultLang('en');

    const saved  = localStorage.getItem(this.STORAGE_KEY);
    const nav    = navigator.language;
    const lang   = this.resolveLocale(saved)
                ?? this.resolveLocale(nav)
                ?? this.resolveLocale(nav?.split('-')[0])
                ?? 'en';

    await this.applyLocale(lang);
    // Notify subscribers so localized data stores can align with startup locale.
    this.languageChange$.next(lang);
  }

  /**
   * Called from SettingsPage when the user explicitly picks a language.
   * Fires languageChange$ so SafetyService (or any subscriber) can reload data.
   */
  async setLanguage(code: string): Promise<void> {
    await this.applyLocale(code);
    this.languageChange$.next(code);
  }

  get current(): string {
    return this.currentLocale();
  }

  isRtl(code: string): boolean {
    return this.locales.find(l => l.code === code)?.rtl ?? false;
  }

  private async applyLocale(code: string): Promise<void> {
    const locale = this.locales.find(l => l.code === code) ?? this.locales[0];
    await firstValueFrom(this.translate.use(locale.code));
    localStorage.setItem(this.STORAGE_KEY, locale.code);
    this.currentLocale.set(locale.code);
    document.documentElement.setAttribute('dir',  locale.rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale.code);
  }

  private resolveLocale(code: string | null | undefined): string | null {
    if (!code) return null;
    // Exact match
    if (this.locales.find(l => l.code === code)) return code;
    // Prefix match: 'zh' → 'zh-Hans', 'pt-BR' → 'pt'
    const prefix = this.locales.find(l =>
      l.code.startsWith(code) || code.startsWith(l.code.split('-')[0])
    );
    return prefix?.code ?? null;
  }
}
