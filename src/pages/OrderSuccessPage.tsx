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
  ShoppingBag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { initializeSocket, subscribeToOrderUpdates, joinBranchRoom, leaveBranchRoom, OrderUpdate } from "@/utils/socket";
import axios from "@/config/axios.config";
import { toast } from "sonner";
import { OrderStatus, OrderStatusType, ORDER_STATUS_STEPS } from "@/types/order.types";

interface OrderProduct {
  id: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
  itemTotal: number;
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
    discountAmount: number;
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

            {/* Order Items Section */}
            {/* <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderDetails?.products.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <ShoppingBag size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Quantity: {item.quantity}</span>
                          <span>×</span>
                          <span>£{((item.itemTotal || 0) / (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-medium">£{(item.itemTotal || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div> */}

                    {/* <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>£{(orderDetails.subtotal || 0).toFixed(2)}</span>
                </div> */}
                
                {/* <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Delivery Fee</span>
                  {!orderDetails.deliveryFee || orderDetails.deliveryFee <= 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Free
                    </span>
                  ) : (
                    <span>£{orderDetails.deliveryFee.toFixed(2)}</span>
                  )}
                </div> */}

            {/* Order Summary */}
            {/* <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-2">
        

                {orderDetails.serviceCharges && orderDetails.serviceCharges.totalAll > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Charge</span>
                    <span>£{orderDetails.serviceCharges.totalAll.toFixed(2)}</span>
                  </div>
                )}

                {orderDetails.discount && orderDetails.discount.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-£{orderDetails.discount.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-green-600">£{(orderDetails?.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSuccessPage;
