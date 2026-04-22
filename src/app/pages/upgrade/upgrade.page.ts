import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RevenueCatService } from '../../services/revenueCat.service';

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

  private revenueCatService = inject(RevenueCatService);

  async ngOnInit() {
    await this.initializeRevenueCat();
  }

  private async initializeRevenueCat() {
    try {
      await this.revenueCatService.init();
      this.hasPremium = this.revenueCatService.isEntitlementActive('premium');
      this.statusMessage = this.hasPremium ? 'You have active Pro access.' : 'Unlock Pro to access full Pilates safety guidance.';
    } catch (error) {
      console.warn('RevenueCat initialization error', error);
      this.statusMessage = 'Unable to initialize purchases. Please try again later.';
    }
  }

  async purchaseMonthly() {
    await this.purchaseProduct('pilatesafe_monthly');
  }

  async purchaseAnnual() {
    await this.purchaseProduct('pilatesafe_annual');
  }

  async purchaseLifetime() {
    await this.purchaseProduct('pilatesafe_lifetime');
  }

  async restorePurchase() {
    this.isProcessing = true;
    try {
      await this.revenueCatService.restorePurchases();
      this.hasPremium = this.revenueCatService.isEntitlementActive('premium');
      this.statusMessage = this.hasPremium ? 'Restored Pro access successfully.' : 'Restore completed, but Pro access is not active.';
    } catch (error) {
      console.warn('Restore error', error);
      this.statusMessage = 'Restore failed. Please try again later.';
    } finally {
      this.isProcessing = false;
    }
  }

  private async purchaseProduct(productId: string) {
    this.isProcessing = true;
    try {
      await this.revenueCatService.purchaseProduct(productId);
      this.hasPremium = this.revenueCatService.isEntitlementActive('premium');
      this.statusMessage = this.hasPremium ? 'Pro is now active. Enjoy premium features!' : 'Purchase complete but Pro access was not detected.';
    } catch (error) {
      console.warn('Purchase failed', error);
      this.statusMessage = 'Purchase failed. Please try again or contact support.';
    } finally {
      this.isProcessing = false;
    }
  }
}
