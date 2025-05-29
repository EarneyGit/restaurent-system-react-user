import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  ChefHat,
  Bike,
  MapPin,
  ArrowLeft,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OrderStatus {
  received: boolean;
  preparing: boolean;
  onTheWay: boolean;
  delivered: boolean;
}

interface OrderProduct {
  id: string;
  product: {
    name: string;
  };
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderNumber: string;
  products: OrderProduct[];
  totalAmount: number;
  finalTotal: number;
  discount?: {
    discountAmount: number;
  };
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
  estimatedTimeToComplete: number;
}

interface StatusStep {
  status: keyof OrderStatus;
  label: string;
  icon: LucideIcon;
  time: string;
}

const statusSteps: StatusStep[] = [
  {
    status: "received",
    label: "Order Received",
    icon: Check,
    time: "0m",
  },
  {
    status: "preparing",
    label: "Preparing Your Order",
    icon: ChefHat,
    time: "15m",
  },
  {
    status: "onTheWay",
    label: "On the Way",
    icon: Bike,
    time: "30m",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: MapPin,
    time: "45m",
  },
];

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const orderDetails = location.state?.orderDetails as OrderDetails | undefined;
  const [showTracking, setShowTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({
    received: true,
    preparing: false,
    onTheWay: false,
    delivered: false,
  });

  useEffect(() => {
    if (!orderDetails && !orderId) {
      navigate("/");
      return;
    }

    // In future: If we have orderId but no orderDetails, fetch order details from API
    // if (orderId && !orderDetails) {
    //   fetchOrderDetails(orderId);
    // }
  }, [orderDetails, orderId, navigate]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    if (showTracking) {
      setIsLoading(true);
      timers = [
        setTimeout(() => {
          setOrderStatus((prev) => ({ ...prev, preparing: true }));
        }, 3000),
        setTimeout(() => {
          setOrderStatus((prev) => ({ ...prev, onTheWay: true }));
        }, 6000),
        setTimeout(() => {
          setOrderStatus((prev) => ({ ...prev, delivered: true }));
          setIsLoading(false);
        }, 9000),
      ];
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [showTracking]);

  if (!orderDetails && !orderId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-3xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {!showTracking ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Success Header */}
              <div className="p-8 text-center bg-green-50 border-b border-gray-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Placed Successfully!
                </h1>
                <p className="text-gray-600">
                  Your order #{orderId || orderDetails?.orderNumber} has been placed
                  successfully.
                </p>
              </div>

              {/* Order Details */}
              <div className="p-8">
                {/* Delivery Details */}
                <div className="mb-8">
                  <div className="flex justify-between items-center pb-5">
                    <div className="flex items-center justify-center">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Delivery Details
                      </h2>
                    </div>
                    {/* Action Buttons */}
                    <div className="">
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => setShowTracking(true)}
                          className="inline-flex items-center justify-center px-3 py-2 text-xs border border-transparent  font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Track Order
                        </button>

                        {isAuthenticated && (
                          <Link
                            to="/orders"
                            className="inline-flex items-center justify-center px-3 py-2 text-xs border border-transparent  font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            View Orders
                          </Link>
                        )}
                        <Link
                          to="/app"
                          className="inline-flex items-center justify-center px-3 py-2 text-xs border border-gray-300 shadow-sm  font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Delivery Address
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {orderDetails.deliveryAddress.street}
                          <br />
                          {orderDetails.deliveryAddress.city}
                          <br />
                          {orderDetails.deliveryAddress.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Estimated Delivery Time
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {orderDetails.estimatedTimeToComplete} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Items
                  </h2>
                  <div className="space-y-4">
                    {orderDetails.products.map((item: OrderProduct) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center">
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900">
                          £{orderDetails.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      {orderDetails.discount?.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-green-600">
                            -£{orderDetails.discount.discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Fee</span>
                        <span className="text-gray-900">£5.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax</span>
                        <span className="text-gray-900">
                          £
                          {(
                            orderDetails.finalTotal -
                              orderDetails.totalAmount -
                              5 || 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between text-base font-medium">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">
                            £{orderDetails.finalTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setShowTracking(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={24} />
                  </button>
                </div>
                
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bike className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tracking Your Order
                  </h2>
                  <p className="text-sm text-gray-500">
                    Order #{orderId || orderDetails?.orderNumber}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Stay updated with real-time tracking of your delicious meal! 🍽️
                  </p>
                </div>

                <div className="space-y-8">
                  {statusSteps.map(({ status, label, icon: Icon, time }) => (
                    <div key={status} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orderStatus[status]
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            orderStatus[status]
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {label}
                        </p>
                        <p className="text-sm text-gray-500">
                          Estimated: +{time}
                        </p>
                      </div>
                      {orderStatus[status] && (
                        <div className="text-green-600">
                          <Check size={20} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OrderSuccessPage;
