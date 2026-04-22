import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RevenueCatService, RevenueCatProduct } from '../../services/revenueCat.service';

const PRODUCT_IDS = {
  monthly: 'pilatesafe_monthly',
  annual: 'pilatesafe_annual',
  lifetime: 'pilatesafe_lifetime',
} as const;

const FALLBACK_PRICES: Record<string, string> = {
  [PRODUCT_IDS.monthly]: '$19.99/mo',
  [PRODUCT_IDS.annual]: '$99.99/yr',
  [PRODUCT_IDS.lifetime]: '$249.99',
};

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './upgrade.page.html',
  styleUrls: ['./upgrade.page.scss']
})
export class UpgradePage implements OnInit {
  hasPremium = false;
  statusMessage = 'Loading premium status...';
  isProcessing = false;
  pricesLoaded = false;

  prices: Record<string, string> = { ...FALLBACK_PRICES };

  private revenueCatService = inject(RevenueCatService);

  async ngOnInit() {
    await this.revenueCatService.init();
    this.syncPremiumState();
    this.loadPrices();
  }

  ionViewWillEnter() {
    this.syncPremiumState();
  }

  private syncPremiumState() {
    this.hasPremium = this.revenueCatService.isEntitlementActive('premium');
    this.statusMessage = this.hasPremium
      ? 'You have active Pro access.'
      : 'Unlock Pro to access full Pilates safety guidance.';
  }

  private async loadPrices() {
    try {
      const ids = Object.values(PRODUCT_IDS);
      const products: RevenueCatProduct[] = await this.revenueCatService.getProducts(ids);
      for (const product of products) {
        const display = product.priceString ?? product.price;
        if (display) {
          // Append billing period hint for subscription products.
          if (product.identifier === PRODUCT_IDS.monthly) {
            this.prices[product.identifier] = `${display}/mo`;
          } else if (product.identifier === PRODUCT_IDS.annual) {
            this.prices[product.identifier] = `${display}/yr`;
          } else {
            this.prices[product.identifier] = display;
          }
        }
      }
    } catch {
      // Keep fallback prices on any error.
    } finally {
      this.pricesLoaded = true;
    }
  }

  get monthlyPrice() { return this.prices[PRODUCT_IDS.monthly]; }
  get annualPrice()  { return this.prices[PRODUCT_IDS.annual]; }
  get lifetimePrice(){ return this.prices[PRODUCT_IDS.lifetime]; }

  async purchaseMonthly()  { await this.purchaseProduct(PRODUCT_IDS.monthly); }
  async purchaseAnnual()   { await this.purchaseProduct(PRODUCT_IDS.annual); }
  async purchaseLifetime() { await this.purchaseProduct(PRODUCT_IDS.lifetime); }

  async restorePurchase() {
    this.isProcessing = true;
    try {
      await this.revenueCatService.restorePurchases();
      this.syncPremiumState();
      if (!this.hasPremium) {
        this.statusMessage = 'Restore completed, but no active Pro subscription was found.';
      }
    } catch (error) {
      console.warn('Restore error', error);
      this.statusMessage = 'Restore failed. Please try again or contact support.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async purchaseProduct(productId: string) {
    this.isProcessing = true;
    try {
      await this.revenueCatService.purchaseProduct(productId);
      this.syncPremiumState();
      if (!this.hasPremium) {
        this.statusMessage = 'Purchase complete but Pro access was not detected. Try restoring purchases.';
      }
    } catch (error) {
      console.warn('Purchase failed', error);
      this.statusMessage = 'Purchase failed. Please try again or contact support.';
    } finally {
      this.isProcessing = false;
    }
  }
}
