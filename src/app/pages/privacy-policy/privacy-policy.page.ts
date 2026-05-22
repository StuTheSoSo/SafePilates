import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  templateUrl: './privacy-policy.page.html',
  styles: ['']
})
export class PrivacyPolicyPage {}
