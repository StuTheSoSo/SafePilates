import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description?: string;
  price?: string;
  priceString?: string;
}

export interface RevenueCatCustomerInfo {
  entitlements?: Record<string, any>;
  [key: string]: any;
}

export const ENTITLEMENT_ID = 'PilateSafe Pro';

@Injectable({ providedIn: 'root' })
export class RevenueCatService {
  private purchases: any | null = null;
  private initialized = false;
  private entitlements: Record<string, boolean> = {};
  public premiumActive$ = new BehaviorSubject<boolean>(false);

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!environment.revenueCatApiKey || environment.revenueCatApiKey.startsWith('YOUR_')) {
      console.warn('RevenueCat API key is not configured. Skipping initialization.');
      this.initialized = true;
      return;
    }

    try {
      const PurchasesModule = await import('@revenuecat/purchases-capacitor');
      const Purchases = PurchasesModule.Purchases ?? PurchasesModule.default ?? PurchasesModule;
      this.purchases = Purchases;

      if (typeof this.purchases.configure === 'function') {
        await this.purchases.configure({ apiKey: environment.revenueCatApiKey });
      } else if (typeof this.purchases.setup === 'function') {
        await this.purchases.setup(environment.revenueCatApiKey);
      } else {
        console.warn('RevenueCat Purchases plugin loaded but no setup method found.');
      }

      await this.refreshCustomerInfo();
    } catch (error) {
      console.warn('RevenueCat initialization failed:', error);
    } finally {
      this.initialized = true;
    }
  }

  async refreshCustomerInfo(): Promise<RevenueCatCustomerInfo | null> {
    if (!this.purchases || !this.isReady()) {
      return null;
    }

    try {
      // The Capacitor SDK wraps the result: { customerInfo: CustomerInfo }
      const result = await this.purchases.getCustomerInfo();
      const customerInfo: RevenueCatCustomerInfo = result?.customerInfo ?? result;
      this.updateEntitlements(customerInfo);
      return customerInfo;
    } catch (error) {
      console.warn('Failed to refresh RevenueCat customer info:', error);
      return null;
    }
  }

  isEntitlementActive(entitlementId = ENTITLEMENT_ID): boolean {
    return !!this.entitlements[entitlementId];
  }

  async purchaseProduct(productIdentifier: string): Promise<any> {
    if (!this.purchases || !this.isReady()) {
      throw new Error('RevenueCat is not initialized.');
    }

    // Resolve a StoreProduct then purchase it — the Capacitor SDK does not expose
    // a bare purchaseProduct(identifier) method.
    const products = await this.getProducts([productIdentifier]);
    if (!products.length) {
      throw new Error(`Product not found: ${productIdentifier}`);
    }

    let purchaseResult: any;
    if (typeof this.purchases.purchaseStoreProduct === 'function') {
      // Current SDK (v8+): purchaseStoreProduct({ product })
      purchaseResult = await this.purchases.purchaseStoreProduct({ product: products[0] });
    } else if (typeof this.purchases.purchasePackage === 'function') {
      // Older SDK path — fall back if available.
      purchaseResult = await this.purchases.purchasePackage({ aPackage: products[0] });
    } else {
      throw new Error('No purchase API available on this RevenueCat build.');
    }

    // SDK wraps result: { customerInfo: CustomerInfo }
    const customerInfo = purchaseResult?.customerInfo ?? purchaseResult;
    if (customerInfo) {
      this.updateEntitlements(customerInfo);
    }
    return purchaseResult;
  }

  async restorePurchases(): Promise<any> {
    if (!this.purchases || !this.isReady()) {
      throw new Error('RevenueCat is not initialized.');
    }

    if (typeof this.purchases.restorePurchases !== 'function') {
      throw new Error('RevenueCat restorePurchases API is unavailable.');
    }

    const result = await this.purchases.restorePurchases();
    // SDK wraps result: { customerInfo: CustomerInfo }
    const customerInfo = result?.customerInfo ?? result;
    if (customerInfo) {
      this.updateEntitlements(customerInfo);
    }
    return result;
  }

  async getProducts(productIdentifiers: string[]): Promise<RevenueCatProduct[]> {
    if (!this.purchases || !this.isReady()) {
      return [];
    }

    if (typeof this.purchases.getProducts !== 'function') {
      return [];
    }

    // SDK returns { products: StoreProduct[] }
    const result = await this.purchases.getProducts({ productIdentifiers });
    return result?.products ?? result ?? [];
  }

  private updateEntitlements(customerInfo: RevenueCatCustomerInfo) {
    this.entitlements = {};

    // SDK structure: customerInfo.entitlements.active is a Record<string, EntitlementInfo>
    // where each key is an entitlement identifier and presence means it is active.
    const entObj = customerInfo?.entitlements;
    if (entObj && typeof entObj === 'object') {
      // Prefer the explicit `active` map (SDK v8+).
      const activeMap: Record<string, any> = entObj.active ?? entObj.all ?? entObj;
      for (const [key, value] of Object.entries(activeMap)) {
        // In `active`, all entries are active by definition.
        // In `all`, each entry has an `isActive` boolean.
        const isActive = typeof value === 'boolean'
          ? value
          : !!(value?.isActive ?? true);
        this.entitlements[key] = isActive;
      }
    }

    this.premiumActive$.next(this.isEntitlementActive(ENTITLEMENT_ID));
  }

  private isReady(): boolean {
    return !!this.purchases;
  }
}
