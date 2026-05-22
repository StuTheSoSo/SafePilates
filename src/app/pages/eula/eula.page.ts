import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-eula',
  standalone: true,
  imports: [CommonModule, IonicModule, TranslateModule],
  templateUrl: './eula.page.html',
  styles: ['']
})
export class EulaPage {}
