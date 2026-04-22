import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-premium-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-banner.component.html',
  styleUrls: ['./premium-banner.component.scss'],
})
export class PremiumBannerComponent {
  @Input() showBanner = true;
  @Output() upgradeClick = new EventEmitter<void>();

  onUpgradeClick(): void {
    this.upgradeClick.emit();
  }
}
