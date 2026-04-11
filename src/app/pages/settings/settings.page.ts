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
    { label: 'Blush (default)', value: 'theme-blush' },
    { label: 'Lavender', value: 'theme-lavender' },
    { label: 'Teal', value: 'theme-teal' },
    { label: 'Sky Blue', value: 'theme-sky' },
    { label: 'Soft Slate', value: 'theme-slate' },
  ];
  selectedTheme = localStorage.getItem('safepilates-theme') || 'theme-blush';

  constructor() {
    this.applyTheme(this.selectedTheme);
  }

  onThemeChange(event: any) {
    const theme = event.detail ? event.detail.value : event;
    this.selectedTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('safepilates-theme', theme);
  }

  applyTheme(theme: string) {
    document.documentElement.classList.remove(...this.themeOptions.map(t => t.value));
    document.documentElement.classList.add(theme);
  }
}
