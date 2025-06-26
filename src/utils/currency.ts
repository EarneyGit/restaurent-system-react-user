/**
 * Format currency in GBP
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate discount savings from discount data
 */
export const calculateDiscountSavings = (
  originalTotal: number,
  discountAmount: number
): number => {
  return Math.min(discountAmount, originalTotal);
};

/**
 * Get discount display text based on discount type
 */
export const getDiscountDisplayText = (
  discountType: string,
  discountValue: number,
  code?: string
): string => {
  const discountText = discountType === 'percentage' 
    ? `${discountValue}% off` 
    : `${formatCurrency(discountValue)} off`;
  
  return code ? `${discountText} (${code})` : discountText;
};

/**
 * Calculate final total with discount applied
 */
export const calculateFinalTotal = (
  originalTotal: number,
  discountAmount: number = 0
): number => {
  return Math.max(0, originalTotal - discountAmount);
}; 