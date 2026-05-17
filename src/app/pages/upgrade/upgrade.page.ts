import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { RevenueCatService, RevenueCatProduct, ENTITLEMENT_ID } from '../../services/revenueCat.service';

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
  [PRODUCT_IDS.monthly]: '$9.99/mo',
  [PRODUCT_IDS.annual]: '$49.99/yr',
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
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    await this.revenueCatService.init();
    this.syncPremiumState();
    this.loadPrices();
  }

  ionViewWillEnter() {
    this.syncPremiumState();
  }

  private syncPremiumState() {
    this.hasPremium = this.revenueCatService.isEntitlementActive(ENTITLEMENT_ID);
    this.statusMessage = this.hasPremium
      ? 'You have active Pro access.'
      : 'Unlock Pro to access full Pilates safety guidance.';
  }

  private async loadPrices() {
    try {
      const ids = Object.values(PRODUCT_IDS);
      const products: RevenueCatProduct[] = await this.revenueCatService.getProducts(ids);
      const updated = { ...this.prices };
      for (const product of products) {
        const display = product.priceString ?? product.price;
        if (display) {
          // Append billing period hint for subscription products.
          if (product.identifier === PRODUCT_IDS.monthly) {
            updated[product.identifier] = `${display}/mo`;
          } else if (product.identifier === PRODUCT_IDS.annual) {
            updated[product.identifier] = `${display}/yr`;
          } else {
            updated[product.identifier] = display;
          }
        }
      }
      this.prices = updated;
    } catch {
      // Keep fallback prices on any error.
    } finally {
      this.pricesLoaded = true;
      this.cdr.detectChanges();
    }
  }

  get monthlyPrice() { return this.prices[PRODUCT_IDS.monthly]; }
  get annualPrice()  { return this.prices[PRODUCT_IDS.annual]; }

  async purchaseMonthly() { await this.purchaseProduct(PRODUCT_IDS.monthly); }
  async purchaseAnnual()  { await this.purchaseProduct(PRODUCT_IDS.annual); }

  async restorePurchase() {
    const loading = await this.loadingCtrl.create({ message: 'Restoring purchases…', spinner: 'crescent' });
    await loading.present();
    try {
      await this.revenueCatService.restorePurchases();
      this.syncPremiumState();
      if (this.hasPremium) {
        await this.showToast('Pro access restored!', 'success');
      } else {
        await this.showToast('No active Pro subscription found.', 'warning');
      }
    } catch (error) {
      console.warn('Restore error', error);
      await this.showToast('Restore failed. Please try again.', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async purchaseProduct(productId: string) {
    const loading = await this.loadingCtrl.create({ message: 'Processing…', spinner: 'crescent' });
    await loading.present();
    this.isProcessing = true;
    try {
      await this.revenueCatService.purchaseProduct(productId);
      this.syncPremiumState();
      if (this.hasPremium) {
        await this.showToast('Welcome to Pro! 🎉', 'success');
      } else {
        await this.showToast('Purchase complete — try Restore if Pro is not active.', 'warning');
      }
    } catch (error: any) {
      console.warn('Purchase failed', JSON.stringify(error));
      // User-cancelled purchases throw with a specific code — don't show an error toast for those.
      const cancelled = error?.code === 'PURCHASE_CANCELLED' ||
                        error?.userCancelled === true ||
                        String(error?.message ?? '').toLowerCase().includes('cancel');
      if (!cancelled) {
        const code = error?.code ?? error?.errorCode ?? 'UNKNOWN';
        const msg = error?.message ?? error?.underlyingErrorMessage ?? '';
        await this.showToast(`Purchase failed [${code}]: ${msg}`.slice(0, 200), 'danger');
      }
    } finally {
      await loading.dismiss();
      this.isProcessing = false;
    }
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3500,
      position: 'bottom',
      color,
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
