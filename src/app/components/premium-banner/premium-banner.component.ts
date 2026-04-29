import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueCatService, RevenueCatProduct } from '../../services/revenueCat.service';

const PRODUCT_IDS = {
  monthly: 'com.pilatesafe.app.monthly',
  annual: 'com.pilatesafe.app.yearly',
  lifetime: 'com.pilatesafe.app.life',
} as const;

const FALLBACK_PRICES: Record<string, string> = {
  [PRODUCT_IDS.monthly]: '$9.99',
  [PRODUCT_IDS.annual]: '$49.99',
  [PRODUCT_IDS.lifetime]: '$249.99',
};

@Component({
  selector: 'app-premium-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-banner.component.html',
  styleUrls: ['./premium-banner.component.scss'],
})
export class PremiumBannerComponent implements OnInit {
  @Input() showBanner = true;
  @Output() upgradeClick = new EventEmitter<void>();

  prices: Record<string, string> = { ...FALLBACK_PRICES };
  hasPremium = false;

  private revenueCatService = inject(RevenueCatService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    await this.revenueCatService.init();
    this.hasPremium = this.revenueCatService.isEntitlementActive();
    await this.loadPrices();
  }

  private async loadPrices() {
    try {
      const ids = Object.values(PRODUCT_IDS);
      const products: RevenueCatProduct[] = await this.revenueCatService.getProducts(ids);
      const updated = { ...this.prices };
      for (const product of products) {
        const display = product.priceString ?? product.price;
        if (display) {
          updated[product.identifier] = display;
        }
      }
      this.prices = updated;
    } catch {
      // Keep fallback prices on any error.
    } finally {
      this.cdr.detectChanges();
    }
  }

  get monthlyPrice() { return this.prices[PRODUCT_IDS.monthly]; }
  get annualPrice()  { return this.prices[PRODUCT_IDS.annual]; }
  get lifetimePrice(){ return this.prices[PRODUCT_IDS.lifetime]; }

  onUpgradeClick(): void {
    this.upgradeClick.emit();
  }
}
