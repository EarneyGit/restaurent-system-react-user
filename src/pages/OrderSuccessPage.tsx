import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  Bike,
  MapPin,
  Loader2,
  LucideIcon,
  AlertCircle,
  ShoppingBag,
  Calculator,
  Percent
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initializeSocket, subscribeToOrderUpdates, joinBranchRoom, leaveBranchRoom, OrderUpdate } from "@/utils/socket";
import axios from "@/config/axios.config";
import { toast } from "sonner";
import { OrderStatus, OrderStatusType, ORDER_STATUS_STEPS } from "@/types/order.types";
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
  status: OrderStatusType;
  createdAt: string;
}

const statusSteps = ORDER_STATUS_STEPS;

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, token } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | undefined>(location.state?.orderDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; requiresAuth?: boolean } | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(OrderStatus.PENDING);
  const [calculationErrors, setCalculationErrors] = useState<string[]>([]);

  // Add auto-update timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (orderDetails && ![OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(orderDetails.status as OrderStatus)) {
      timer = setInterval(() => {
        fetchOrderDetails();
      }, 30000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [orderDetails?.status]);

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
      navigate('/outlet-selection', { state: { returnUrl: `/order-status/${orderId}` } });
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

      console.log('Order API response:', response.data);

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
        setCurrentStatus(order.status);
        
        // Join the branch room for real-time updates
        if (branchId) {
          joinBranchRoom(branchId);
        }

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

  useEffect(() => {
    if (orderDetails?.branchId?._id) {
      const socket = initializeSocket();

      console.log('Socket initialized, joining branch room:', orderDetails.branchId._id);

      const unsubscribe = subscribeToOrderUpdates((data: OrderUpdate) => {
        console.log('Socket update received:', data);
        
        if (data.orderId === orderId) {
          console.log('Updating order status:', data.status);
          setCurrentStatus(data.status);
          toast.info(data.message || `Order status updated to ${data.status}`);
        }
      });

      joinBranchRoom(orderDetails.branchId._id);

      return () => {
        console.log('Cleaning up socket connection');
        unsubscribe();
        leaveBranchRoom(orderDetails.branchId._id);
      };
    }
  }, [orderDetails?.branchId?._id, orderId]);

  // Helper function to determine if a step is active
  const isStepActive = (stepStatus: OrderStatusType) => {
    const statusOrder: OrderStatusType[] = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.COMPLETED];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return stepIndex <= currentIndex;
  };

  // Helper function to get step status class
  const getStepStatusClass = (stepStatus: OrderStatusType) => {
    if (currentStatus === stepStatus) return 'bg-green-600 text-white animate-pulse';
    if (isStepActive(stepStatus)) return 'bg-green-600 text-white';
    return 'bg-gray-100 text-gray-400';
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
          <div className="space-y-3">
            {error.requiresAuth ? (
              <>
                <Link
                  to="/login"
                  state={{ returnUrl: `${location.pathname}${location.search}` }}
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Login to View Order
                </Link>
                <Link
                  to="/app"
                  className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Go to Menu
                </Link>
              </>
            ) : (
              <Link
                to="/app"
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Menu
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Could not find order details.</p>
          <Link
            to="/app"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bike className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tracking Your Order
              </h2>
              <p className="text-sm text-gray-500">
                Order #{orderDetails?.orderNumber}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ID: {orderDetails?._id}
              </p>
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700">
                <span className="font-medium">Current Status: </span>
                <span className="ml-2 capitalize">
                  {currentStatus === OrderStatus.COMPLETED ? "Completed" :
                   currentStatus === OrderStatus.PROCESSING ? "Processing" :
                   currentStatus === OrderStatus.PENDING ? "Pending" :
                   currentStatus === OrderStatus.CANCELLED ? "Cancelled" : currentStatus}
                </span>
              </div>
              {orderDetails?.estimatedTimeToComplete && (
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <p className="text-green-700">
                    Estimated Time: {orderDetails.estimatedTimeToComplete} minutes
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {statusSteps.map(({ status, label, icon: Icon, description }, idx) => (
                <div key={status} className="relative">
                  {/* Only render the vertical line if not the last step */}
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-16 transition-colors duration-300 ${
                        isStepActive(status) ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        getStepStatusClass(status)
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold transition-colors duration-300 ${
                        isStepActive(status) ? "text-gray-900" : "text-gray-400"
                      }`}>
                        {label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {description}
                      </p>
                      {currentStatus === status && (
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current Status
                        </span>
                      )}
                    </div>
                    {isStepActive(status) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600"
                      >
                        <Check size={20} />
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </div>

                        {/* Order Items Section - Clean Minimal Design */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Your Order</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
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
                              <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-medium border border-green-200">
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
                            <span className="text-xl font-semibold text-green-600">
                              {safeFormatCurrency(item.itemTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {item.notes && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">!</span>
                              </div>
                              <span className="text-sm font-medium text-green-800">Note:</span>
                            </div>
                            <p className="text-sm text-green-700 ml-6">{item.notes}</p>
                          </div>
                        )}

                        {/* Selected Attributes */}
                        {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Add-ons</span>
                            </div>
                            
                            <div className="space-y-3 ml-4">
                              {item.selectedAttributes.map((attr, attrIndex) => (
                                <div key={attrIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="mb-2">
                                    <span className="font-medium text-gray-800 text-sm">{attr.attributeName}:</span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    {attr.selectedItems.map((selectedItem, itemIndex) => (
                                      <div key={itemIndex} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">
                                          • {selectedItem.itemName}
                                          {selectedItem.quantity > 1 && (
                                            <span className="ml-1 text-xs text-gray-500">
                                              (×{selectedItem.quantity})
                                            </span>
                                          )}
                                        </span>
                                        {selectedItem.itemPrice > 0 && (
                                          <span className="text-sm font-medium text-neutral-600">
                                            +{safeFormatCurrency(selectedItem.itemPrice * Math.max(1, selectedItem.quantity))}
                                          </span>
                                        )}
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
                                <span className="font-medium text-neutral-600">
                                  +{safeFormatCurrency(item.price.attributes * Math.max(1, item.quantity))}
                                </span>
                              </div>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="flex justify-between items-center font-medium">
                                <span className="text-gray-800">Item Total</span>
                                <span className="text-neutral-600">
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
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
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
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
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
                    <div className="flex justify-between items-center ">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <Percent size={10} className="text-white" />
                        </div>
                        <span className="text-gray-700">
                          Discount ({orderDetails.discountApplied?.code || orderDetails.discount?.code})
                        </span>
                      </div>
                      <span className="font-medium text-green-600">
                        -{safeFormatCurrency(orderDetails.discountApplied?.discountAmount || orderDetails.discount?.discountAmount)}
                      </span>
                      
                    </div>
                  )}
                                    {/* Savings */}
                                    {((orderDetails.discount && orderDetails.discount.discountAmount > 0) || 
                    (orderDetails.discountApplied && orderDetails.discountApplied.discountAmount > 0)) && (
                    <div className="text-right text-sm text-green-600 font-medium">
                      You saved {safeFormatCurrency(orderDetails.discountApplied?.discountAmount || orderDetails.discount?.discountAmount)}!
                    </div>
                  )}

                  <div className="h-px bg-gray-200 my-4"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded-lg border border-green-200">
                    <span className="text-gray-900 font-semibold text-lg">Total Paid</span>
                    <span className="text-xl font-bold text-neutral-600">
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

export default OrderSuccessPage;
