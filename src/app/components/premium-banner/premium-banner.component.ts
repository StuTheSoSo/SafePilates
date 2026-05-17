import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { RevenueCatService, RevenueCatProduct } from '../../services/revenueCat.service';

const PRODUCT_IDS = Capacitor.getPlatform() === 'ios'
  ? {
      monthly: 'com.pilatesafe.app.monthly',
      annual:  'com.pilatesafe.app.yearly',
    }
  : {
      monthly: 'pilatesafe_pro_monthly:monthly-premium-plan',
      annual:  'pilatesafe_pro_monthly:yearly-premium-plan',
    };

const FALLBACK_PRICES: Record<string, string> = {
  [PRODUCT_IDS.monthly]: '$9.99',
  [PRODUCT_IDS.annual]: '$49.99',
};

@Component({
  selector: 'app-premium-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-banner.component.html',
  styleUrls: ['./premium-banner.component.scss'],
})
export class PremiumBannerComponent implements OnInit, OnDestroy {
  @Input() showBanner = true;
  @Output() upgradeClick = new EventEmitter<void>();

  prices: Record<string, string> = { ...FALLBACK_PRICES };
  hasPremium = false;

  private revenueCatService = inject(RevenueCatService);
  private cdr = inject(ChangeDetectorRef);
  private premiumSub?: Subscription;

  async ngOnInit() {
    await this.revenueCatService.init();
    this.premiumSub = this.revenueCatService.premiumActive$.subscribe(active => {
      this.hasPremium = active;
      this.cdr.detectChanges();
    });
    await this.loadPrices();
  }

  ngOnDestroy() {
    this.premiumSub?.unsubscribe();
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

  onUpgradeClick(): void {
    this.upgradeClick.emit();
  }
}
