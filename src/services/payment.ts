import {
  KASHIER_PLANS,
  KashierPlan,
  kashierService,
  KashierTransaction,
  KashierPaymentMethod,
  SupportedCurrency,
} from './kashierPaymentService';

export interface SubscriptionPlan {
  id: 'monthly' | 'annual' | 'hawameer';
  nameAr: string;
  nameEn: string;
  priceSar: number;
  priceEgp?: number;
  intervalAr: string;
  equivalentMonthlyPriceSar?: number;
  discountBadge?: string;
  descriptionAr: string;
  features: string[];
}

// Bridged SUBSCRIPTION_PLANS for backward compatibility with psychological updates
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = KASHIER_PLANS.map((kp) => ({
  id: kp.id as 'monthly' | 'annual' | 'hawameer',
  nameAr: kp.tierNameAr,
  nameEn: kp.tierNameEn,
  priceSar: kp.priceSar,
  priceEgp: kp.priceEgp,
  intervalAr: kp.intervalAr,
  equivalentMonthlyPriceSar: kp.id === 'annual' ? 12.4 : kp.id === 'hawameer' ? 22.1 : undefined,
  discountBadge: kp.badge,
  descriptionAr: kp.descriptionAr,
  features: kp.features.map((f) => f.title),
}));

export interface PaymentTransaction {
  transactionId: string;
  planId: 'monthly' | 'annual' | 'hawameer';
  amountSar: number;
  paymentMethod: 'mada' | 'apple_pay' | 'visa_mastercard' | 'kashier';
  status: 'succeeded' | 'failed' | 'pending';
  timestamp: string;
  receiptNumber: string;
}

/**
 * Payment processor powered by Kashier Payment Gateway
 */
class BalootPaymentService {
  /**
   * Process checkout via Kashier
   */
  public async processCheckout(
    planId: 'monthly' | 'annual' | 'hawameer',
    method: 'mada' | 'apple_pay' | 'visa_mastercard',
    cardNumber?: string,
    currency: SupportedCurrency = 'SAR'
  ): Promise<{ success: boolean; transaction?: PaymentTransaction; error?: string }> {
    const kashierMethod: KashierPaymentMethod =
      method === 'apple_pay' ? 'apple_pay' : 'card';

    const result = await kashierService.processKashierCheckout({
      planId,
      method: kashierMethod,
      currency,
      cardNumber,
    });

    if (!result.success || !result.transaction) {
      return { success: false, error: result.error || 'تعذر إتمام الدفع عبر بوابة كاشير' };
    }

    const tx: PaymentTransaction = {
      transactionId: result.transaction.orderId,
      planId,
      amountSar: result.transaction.amount,
      paymentMethod: method,
      status: 'succeeded',
      timestamp: result.transaction.createdAt,
      receiptNumber: result.transaction.receiptNumber,
    };

    return { success: true, transaction: tx };
  }
}

export const paymentService = new BalootPaymentService();
export { kashierService, KASHIER_PLANS, type KashierPlan, type KashierTransaction };
