import { formatCurrency } from "./currency";

export interface PriceStructure {
  base: number;
  currentEffectivePrice: number;
  attributes: number;
  total: number;
}

export interface SelectedAttributeItem {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface SelectedAttribute {
  attributeId: string;
  attributeName: string;
  attributeType: string;
  selectedItems: SelectedAttributeItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: PriceStructure | number;
  itemTotal: number;
  selectedAttributes?: SelectedAttribute[];
  notes?: string;
}

export interface DiscountInfo {
  discountId: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  originalTotal: number;
}

export interface OrderTotals {
  subtotal: number;
  attributesTotal: number;
  deliveryFee: number;
  serviceCharges: number;
  discountAmount: number;
  finalTotal: number;
  savings: number;
}

/**
 * Check if price is a structured price object
 */
export function isPriceObject(price: unknown): price is PriceStructure {
  return (
    typeof price === 'object' &&
    price !== null &&
    'base' in price &&
    'currentEffectivePrice' in price &&
    'attributes' in price &&
    'total' in price
  );
}

/**
 * Calculate attribute total for a single item
 */
export function calculateAttributeTotal(selectedAttributes: SelectedAttribute[] = []): number {
  return selectedAttributes.reduce((total, attr) => {
    return total + attr.selectedItems.reduce((sum, item) => {
      return sum + Math.max(0, item.itemPrice * Math.max(1, item.quantity));
    }, 0);
  }, 0);
}

/**
 * Calculate item total including attributes
 */
export function calculateItemTotal(item: OrderItem): number {
  const basePrice = isPriceObject(item.price) ? item.price.base : (typeof item.price === 'number' ? item.price : 0);
  const quantity = Math.max(1, item.quantity);
  
  // Calculate base total
  const baseTotal = Math.max(0, basePrice * quantity);
  
  // Calculate attributes total
  const attributesTotal = item.selectedAttributes 
    ? calculateAttributeTotal(item.selectedAttributes) * quantity
    : 0;
  
  const total = baseTotal + attributesTotal;
  
  // Ensure the calculated total matches the provided itemTotal if available
  return item.itemTotal !== undefined ? Math.max(0, item.itemTotal) : Math.max(0, total);
}

/**
 * Calculate order totals with proper error handling
 */
export function calculateOrderTotals(
  items: OrderItem[],
  deliveryFee: number = 0,
  serviceCharges: number = 0,
  discount?: DiscountInfo
): OrderTotals {
  // Calculate subtotal (base prices only)
  const subtotal = items.reduce((total, item) => {
    const basePrice = isPriceObject(item.price) ? item.price.base : (typeof item.price === 'number' ? item.price : 0);
    const quantity = Math.max(1, item.quantity);
    return total + Math.max(0, basePrice * quantity);
  }, 0);

  // Calculate attributes total
  const attributesTotal = items.reduce((total, item) => {
    if (!item.selectedAttributes) return total;
    const quantity = Math.max(1, item.quantity);
    return total + (calculateAttributeTotal(item.selectedAttributes) * quantity);
  }, 0);

  // Ensure non-negative values
  const safeDeliveryFee = Math.max(0, deliveryFee);
  const safeServiceCharges = Math.max(0, serviceCharges);
  const discountAmount = discount ? Math.max(0, discount.discountAmount) : 0;

  // Calculate totals before discount
  const totalBeforeDiscount = subtotal + attributesTotal + safeDeliveryFee + safeServiceCharges;
  
  // Apply discount but ensure final total is never negative
  const finalTotal = Math.max(0, totalBeforeDiscount - discountAmount);
  
  // Calculate actual savings (discount might be capped by total)
  const actualSavings = totalBeforeDiscount - finalTotal;

  return {
    subtotal: Math.max(0, subtotal),
    attributesTotal: Math.max(0, attributesTotal),
    deliveryFee: safeDeliveryFee,
    serviceCharges: safeServiceCharges,
    discountAmount: Math.max(0, actualSavings),
    finalTotal: Math.max(0, finalTotal),
    savings: Math.max(0, actualSavings)
  };
}

/**
 * Format discount display text
 */
export function formatDiscountText(discount: DiscountInfo): string {
  if (discount.discountType === 'percentage') {
    return `${discount.discountValue}% off`;
  } else {
    return `${formatCurrency(discount.discountValue)} off`;
  }
}

/**
 * Validate order calculations
 */
export function validateOrderCalculations(
  items: OrderItem[],
  totals: OrderTotals
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for negative values
  if (totals.subtotal < 0) errors.push('Subtotal cannot be negative');
  if (totals.attributesTotal < 0) errors.push('Attributes total cannot be negative');
  if (totals.deliveryFee < 0) errors.push('Delivery fee cannot be negative');
  if (totals.serviceCharges < 0) errors.push('Service charges cannot be negative');
  if (totals.discountAmount < 0) errors.push('Discount amount cannot be negative');
  if (totals.finalTotal < 0) errors.push('Final total cannot be negative');

  // Check if items have valid quantities
  items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1} has invalid quantity: ${item.quantity}`);
    }
  });

  // Check if discount doesn't exceed total
  const totalBeforeDiscount = totals.subtotal + totals.attributesTotal + totals.deliveryFee + totals.serviceCharges;
  if (totals.discountAmount > totalBeforeDiscount) {
    errors.push('Discount amount exceeds order total');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Safe number formatting to prevent display errors
 */
export function safeFormatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return formatCurrency(0);
  }
  return formatCurrency(Math.max(0, amount));
} 