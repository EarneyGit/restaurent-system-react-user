import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  X,
  AlertCircle,
  RefreshCw,
  Home,
  CreditCard,
  Loader2,
  LucideIcon,
  ShoppingBag,
  Calculator,
  Percent
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/config/axios.config";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/currency";
import { 
  isPriceObject, 
  calculateOrderTotals, 
  validateOrderCalculations, 
  safeFormatCurrency,
  formatDiscountText,
  type OrderItem,
  type DiscountInfo 
} from "@/utils/orderCalculations";

interface OrderProduct {
  id: string;
  product: {
    _id: string;
    name: string;
    description?: string;
    images?: string[];
    price: number;
  };
  quantity: number;
  price: {
    base: number;
    currentEffectivePrice: number;
    attributes: number;
    total: number;
  };
  notes?: string;
  itemTotal: number;
  selectedAttributes?: {
    attributeId: string;
    attributeName: string;
    attributeType: string;
    selectedItems: {
      itemId: string;
      itemName: string;
      itemPrice: number;
      quantity: number;
    }[];
  }[];
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  products: OrderProduct[];
  totalAmount: number;
  finalTotal: number;
  subtotal: number;
  deliveryFee: number;
  serviceCharges?: {
    totalMandatory: number;
    totalOptional: number;
    totalAll: number;
    breakdown: Array<{
      id: string;
      name: string;
      type: string;
      value: number;
      amount: number;
      optional: boolean;
    }>;
  };
  discount?: {
    discountId: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    originalTotal: number;
  };
  discountApplied?: {
    discountId: string;
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    originalTotal: number;
    appliedAt: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
  estimatedTimeToComplete: number;
  branchId: {
    _id: string;
    name: string;
  };
  status: string;
  createdAt: string;
}

const OrderFailurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, token } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | undefined>(location.state?.orderDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; requiresAuth?: boolean } | null>(null);
  const [calculationErrors, setCalculationErrors] = useState<string[]>([]);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const handleError = (err: unknown) => {
    console.error('Error fetching order details:', err);
    const error = err as { 
      response?: { 
        data?: { 
          message?: string; 
          requiresAuth?: boolean 
        }; 
        status?: number 
      }; 
      message?: string 
    };
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order details';
    const requiresAuth = error.response?.data?.requiresAuth || false;
    
    setError({ message: errorMessage, requiresAuth });
    toast.error(errorMessage);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      navigate('/app', { replace: true });
    } else if (errorMessage.includes('Branch ID is required')) {
      navigate('/select-outlet', { state: { returnUrl: `/order-failure/${orderId}` } });
      // navigate('/outlet-selection', { state: { returnUrl: `/order-failure/${orderId}` } });
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching order details for ID:', orderId);

      // Get branchId from URL params first
      const urlParams = new URLSearchParams(window.location.search);
      let branchId = urlParams.get('branchId');

      // If no branchId in URL, try other sources
      if (!branchId) {
        branchId = location.state?.orderDetails?.branchId?._id;
        if (!branchId) {
          branchId = localStorage.getItem('selectedBranchId');
        }
      }

      if (!branchId) {
        throw new Error('Branch ID is required. Please select a branch first.');
      }

      // Set up headers based on authentication status
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Make API call with branchId in query params
      const response = await axios.get(
        `/api/orders/${orderId}`,
        {
          headers,
          params: { branchId }
        }
      );

      if (response.data.success) {
        const order = response.data.data;
        
        // Validate order calculations
        if (order.products && order.products.length > 0) {
          const orderItems: OrderItem[] = order.products.map(p => ({
            id: p.id,
            quantity: p.quantity,
            price: p.price,
            itemTotal: p.itemTotal,
            selectedAttributes: p.selectedAttributes,
            notes: p.notes
          }));
          
          const discount: DiscountInfo | undefined = (order.discount || order.discountApplied) ? {
            discountId: (order.discountApplied?.discountId || order.discount?.discountId) || '',
            code: (order.discountApplied?.code || order.discount?.code) || '',
            name: (order.discountApplied?.name || order.discount?.name) || '',
            discountType: (order.discountApplied?.discountType || order.discount?.discountType) as 'percentage' | 'fixed' || 'fixed',
            discountValue: (order.discountApplied?.discountValue || order.discount?.discountValue) || 0,
            discountAmount: (order.discountApplied?.discountAmount || order.discount?.discountAmount) || 0,
            originalTotal: (order.discountApplied?.originalTotal || order.discount?.originalTotal) || 0
          } : undefined;
          
          const calculatedTotals = calculateOrderTotals(
            orderItems,
            order.deliveryFee || 0,
            order.serviceCharges?.totalAll || 0,
            discount
          );
          
          const validation = validateOrderCalculations(orderItems, calculatedTotals);
          if (!validation.isValid) {
            console.warn('Order calculation validation failed:', validation.errors);
            setCalculationErrors(validation.errors);
          } else {
            setCalculationErrors([]);
          }
        }
        
        setOrderDetails(order);

        // Update URL with branchId if not present
        if (!urlParams.has('branchId')) {
          const newUrl = `${window.location.pathname}?branchId=${branchId}`;
          window.history.replaceState({}, '', newUrl);
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch order details');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleRetryPayment = async () => {
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    setIsRetryingPayment(true);
    try {
      // Call the payment intent API
      const response = await axios.post('/api/payment/intent', {
        orderId: orderId
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (response.data?.success && response.data?.data?.clientSecret) {
        // Redirect to Stripe payment or handle payment flow
        toast.success("Payment retry initiated");
        // You can implement Stripe redirect here
        // window.location.href = response.data.data.paymentUrl;
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (error) {
      console.error('Payment retry error:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Failed to retry payment");
    } finally {
      setIsRetryingPayment(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error.requiresAuth ? 'Authentication Required' : 'Access Denied'}
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          
          {error.requiresAuth ? (
            <>
              <Link
                to="/login"
                state={{ returnUrl: `${location.pathname}${location.search}` }}
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mb-2"
              >
                Login to View Order
              </Link>
              <Link
                to="/"
                className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Go to Home
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go to Home
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Could not find order details.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Payment Failed
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Order #{orderDetails?.orderNumber}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                ID: {orderDetails?._id}
              </p>
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-red-50 text-red-700">
                <span className="font-medium">Payment Status: </span>
                <span className="ml-2 capitalize">
                  Failed
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-4 max-w-md mx-auto">
                We couldn't process your payment. This could be due to insufficient funds, 
                card restrictions, or a temporary issue. Please try again or use a different payment method.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* <button
                onClick={handleRetryPayment}
                disabled={isRetryingPayment}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetryingPayment ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    Retry Payment
                  </>
                )}
              </button> */}
              <Link
                to="/checkout"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <CreditCard size={18} />
                New Order
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Home size={18} />
                Go Home
              </Link>
            </div>

            {/* Order Items Section - Clean Minimal Design */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Your Order</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                  {orderDetails?.products.length} {orderDetails?.products.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="space-y-4">
                {orderDetails?.products.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="flex items-start gap-4">
                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 text-lg mb-1">{item.product.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-medium border border-red-200">
                                Qty: {Math.max(1, item.quantity)}
                              </span>
                              <span className="text-gray-400">×</span>
                              <span className="font-medium">
                                {safeFormatCurrency(isPriceObject(item.price) ? item.price.base : (typeof item.price === 'number' ? item.price : 0))}
                              </span>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right">
                            <span className="text-xl font-semibold text-red-600">
                              {safeFormatCurrency(item.itemTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">!</span>
                              </div>
                              <span className="text-sm font-medium text-red-800">Note:</span>
                            </div>
                            <p className="text-sm text-red-700 ml-6">{item.notes}</p>
                          </div>
                        )}

                        {/* Selected Attributes */}
                        {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Add-ons</span>
                            </div>
                            
                            <div className="space-y-3 ml-4">
                              {item.selectedAttributes.map((attr, attrIndex) => (
                                <div key={attrIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="mb-2">
                                    <span className="font-medium text-gray-800 text-sm">{attr.attributeName}:</span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {attr.selectedItems.map((selectedItem, itemIndex) => (
                                      <div key={itemIndex} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">{selectedItem.itemName}</span>
                                        <span className="font-medium text-gray-800">
                                          {safeFormatCurrency(selectedItem.itemPrice)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Breakdown */}
                        {isPriceObject(item.price) && item.price.attributes > 0 && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Base Price ({Math.max(1, item.quantity)}×)</span>
                                <span className="font-medium text-gray-800">
                                  {safeFormatCurrency(item.price.base * Math.max(1, item.quantity))}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Add-ons</span>
                                <span className="font-medium text-red-600">
                                  +{safeFormatCurrency(item.price.attributes * Math.max(1, item.quantity))}
                                </span>
                              </div>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="flex justify-between items-center font-medium">
                                <span className="text-gray-800">Item Total</span>
                                <span className="text-red-600">
                                  {safeFormatCurrency(item.itemTotal)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Show calculation errors if any */}
            {calculationErrors.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Calculation Warnings:</h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {calculationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Order Summary - Clean Minimal Design */}
            <div className="mt-8 pt-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Calculator size={18} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
                </div>

                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium text-gray-900">{safeFormatCurrency(orderDetails.subtotal)}</span>
                  </div>
                  
                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">Delivery Fee</span>
                    {!orderDetails.deliveryFee || orderDetails.deliveryFee <= 0 ? (
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        FREE
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{safeFormatCurrency(orderDetails.deliveryFee)}</span>
                    )}
                  </div>

                  {/* Service Charges */}
                  {orderDetails.serviceCharges && orderDetails.serviceCharges.totalAll > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Service Charge</span>
                      <span className="font-medium text-gray-900">{safeFormatCurrency(orderDetails.serviceCharges.totalAll)}</span>
                    </div>
                  )}

                  {/* Discount */}
                  {((orderDetails.discount && orderDetails.discount.discountAmount > 0) || 
                    (orderDetails.discountApplied && orderDetails.discountApplied.discountAmount > 0)) && (
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <Percent size={10} className="text-white" />
                        </div>
                        <span className="text-gray-700">
                          Discount ({orderDetails.discountApplied?.code || orderDetails.discount?.code})
                        </span>
                      </div>
                      <span className="font-medium text-red-600">
                        -{safeFormatCurrency(orderDetails.discountApplied?.discountAmount || orderDetails.discount?.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="h-px bg-gray-200 my-4"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-900 font-semibold text-lg">Total Amount</span>
                    <span className="text-xl font-bold text-red-600">
                      {safeFormatCurrency(orderDetails?.finalTotal || orderDetails?.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderFailurePage; 