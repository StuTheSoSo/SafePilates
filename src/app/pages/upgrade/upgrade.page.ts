import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { RevenueCatService, RevenueCatProduct, ENTITLEMENT_ID } from '../../services/revenueCat.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, IonicModule, RouterModule, TranslatePipe],
  templateUrl: './upgrade.page.html',
  styleUrls: ['./upgrade.page.scss']
})
export class UpgradePage implements OnInit, OnDestroy {
  hasPremium = false;
  statusMessageKey = 'UPGRADE.STATUS_LOADING';
  isProcessing = false;
  pricesLoaded = false;

  prices: Record<string, string> = { ...FALLBACK_PRICES };
  annualWeeklyPrice = '';
  private baseProductPrices: Record<string, string> = {};
  private langSub?: Subscription;

  private revenueCatService = inject(RevenueCatService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  async ngOnInit() {
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.updateLocalizedPrices();
      this.cdr.detectChanges();
    });
    await this.revenueCatService.init();
    this.syncPremiumState();
    this.loadPrices();
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  ionViewWillEnter() {
    this.syncPremiumState();
  }

  private syncPremiumState() {
    this.hasPremium = this.revenueCatService.isEntitlementActive(ENTITLEMENT_ID);
    this.statusMessageKey = this.hasPremium
      ? 'UPGRADE.STATUS_ACTIVE'
      : 'UPGRADE.STATUS_INACTIVE';
  }

  private async loadPrices() {
    try {
      const ids = Object.values(PRODUCT_IDS);
      const products: RevenueCatProduct[] = await this.revenueCatService.getProducts(ids);
      const updatedBase = { ...this.baseProductPrices };
      for (const product of products) {
        const display = product.priceString ?? product.price;
        if (display) {
          updatedBase[product.identifier] = display;
        }
        if (product.identifier === PRODUCT_IDS.annual) {
          this.annualWeeklyPrice = product.pricePerWeekString ?? '';
        }
      }
      this.baseProductPrices = updatedBase;
      this.updateLocalizedPrices();
    } catch {
      // Keep fallback prices on any error.
      this.updateLocalizedPrices();
    } finally {
      this.pricesLoaded = true;
      this.cdr.detectChanges();
    }
  }

  private updateLocalizedPrices() {
    const monthlyBase = this.baseProductPrices[PRODUCT_IDS.monthly] ?? FALLBACK_PRICES[PRODUCT_IDS.monthly].replace('/mo', '');
    const annualBase = this.baseProductPrices[PRODUCT_IDS.annual] ?? FALLBACK_PRICES[PRODUCT_IDS.annual].replace('/yr', '');

    this.prices = {
      ...this.prices,
      [PRODUCT_IDS.monthly]: `${monthlyBase}${this.translate.instant('UPGRADE.MONTH_SUFFIX')}`,
      [PRODUCT_IDS.annual]: `${annualBase}${this.translate.instant('UPGRADE.YEAR_SUFFIX')}`,
    };
  }

  get monthlyPrice() { return this.prices[PRODUCT_IDS.monthly]; }
  get annualPrice()  { return this.prices[PRODUCT_IDS.annual]; }

  async purchaseMonthly() { await this.purchaseProduct(PRODUCT_IDS.monthly); }
  async purchaseAnnual()  { await this.purchaseProduct(PRODUCT_IDS.annual); }

  async restorePurchase() {
    const loading = await this.loadingCtrl.create({ message: this.translate.instant('UPGRADE.RESTORING_PURCHASES'), spinner: 'crescent' });
    await loading.present();
    try {
      await this.revenueCatService.restorePurchases();
      this.syncPremiumState();
      if (this.hasPremium) {
        await this.showToast(this.translate.instant('UPGRADE.RESTORE_SUCCESS'), 'success');
      } else {
        await this.showToast(this.translate.instant('UPGRADE.RESTORE_NONE'), 'warning');
      }
    } catch (error) {
      console.warn('Restore error', error);
      await this.showToast(this.translate.instant('UPGRADE.RESTORE_FAILED'), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private async purchaseProduct(productId: string) {
    const loading = await this.loadingCtrl.create({ message: this.translate.instant('UPGRADE.PROCESSING'), spinner: 'crescent' });
    await loading.present();
    this.isProcessing = true;
    try {
      await this.revenueCatService.purchaseProduct(productId);
      this.syncPremiumState();
      if (this.hasPremium) {
        await this.showToast(this.translate.instant('UPGRADE.PURCHASE_WELCOME'), 'success');
      } else {
        await this.showToast(this.translate.instant('UPGRADE.PURCHASE_COMPLETE_INACTIVE'), 'warning');
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
        await this.showToast(this.translate.instant('UPGRADE.PURCHASE_FAILED', { code, msg }).slice(0, 200), 'danger');
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
