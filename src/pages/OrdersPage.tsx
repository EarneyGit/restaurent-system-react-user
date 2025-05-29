import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package2,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Calendar,
  Building2,
  ChevronDown,
  CreditCard,
  Info,
} from "lucide-react";
import {
  format,
  subDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import axios from "@/config/axios.config";
import { ORDER_ENDPOINTS } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  notes?: string;
  selectedAttributes: Array<{
    name: string;
    value: string;
  }>;
}

interface Order {
  _id: string;
  orderNumber: string;
  branchId: {
    _id: string;
    name: string;
    address: string;
  };
  products: Product[];
  status: "processing" | "delivered" | "cancelled";
  totalAmount: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: "card" | "cash";
  orderType: "delivery" | "pickup";
  createdAt: string;
  updatedAt: string;
}

type TimeFilter = "all" | "today" | "week" | "month";
type StatusFilter = "all" | "processing" | "delivered" | "cancelled";

interface Branch {
  _id: string;
  name: string;
}

const OrderSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse shadow-sm">
    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-24 bg-gray-200/70 rounded-md"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
      </div>
    </div>
    <div className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-gray-200/70 rounded-md mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-200/50 rounded-md"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-12 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("");
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const { isAuthenticated, token } = useAuth();

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoadingBranches(true);
        const response = await axios.get("http://localhost:5000/api/branches");
        if (response.data?.success) {
          setAvailableBranches(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, []);

  // Fetch orders based on selected branch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        if (!isAuthenticated) {
          toast.error("Please login to view orders");
          navigate("/login");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Use the selected branch for filtering
        const url = selectedBranchFilter
          ? `${ORDER_ENDPOINTS.MY_ORDERS}?branchId=${selectedBranchFilter}`
          : ORDER_ENDPOINTS.MY_ORDERS;

        const response = await axios.get(url, {
          headers,
          params: {}, // Ensure clean params
        });

        if (response.data?.success) {
          setOrders(response.data.data);
          setFilteredOrders(response.data.data);
        } else {
          toast.error("Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, selectedBranchFilter, navigate]);

  // Apply time filter
  useEffect(() => {
    let filtered = [...orders];

    if (timeFilter !== "all") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();

        switch (timeFilter) {
          case "today":
            return isWithinInterval(orderDate, {
              start: startOfDay(now),
              end: endOfDay(now),
            });
          case "week":
            return orderDate >= subDays(now, 7);
          case "month":
            return orderDate >= subDays(now, 30);
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [timeFilter, statusFilter, orders]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="text-green-500" size={20} />;
      case "processing":
        return <Clock className="text-yellow-500" size={20} />;
      case "cancelled":
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        {/* Orders Content */}
        <div className="z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:pt-14 pt-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-all"
                >
                  <ArrowLeft size={24} className="text-neutral-600" />
                </button>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-neutral-800">
                    My Orders
                  </h1>
                  <div className="relative group">
                    <button className="p-1.5 mt-1 hover:bg-neutral-50 rounded-full transition-all">
                      <Info size={18} className="text-neutral-400" />
                    </button>
                    <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 hidden group-hover:block z-20">
                      <h4 className="font-medium text-neutral-800 mb-2">
                        About Orders Page
                      </h4>
                      <p className="text-sm text-neutral-600">
                        View and track all your orders in one place. Use filters
                        to find specific orders by time period, status, or
                        branch location. Each order shows detailed information
                        including items, pricing, and delivery details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all border border-gray-300 flex items-center gap-2 ${
                  showFilters
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {showFilters ? (
                  <>
                    <X size={18} />
                    <span className="text-sm font-medium">Hide Filters</span>
                  </>
                ) : (
                  <>
                    <Filter size={18} />
                    <span className="text-sm font-medium ">Show Filters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white border-b mt-10">
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Period */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      Time Period
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "all", label: "All Time" },
                      { value: "today", label: "Today" },
                      { value: "week", label: "Last 7 Days" },
                      { value: "month", label: "Last 30 Days" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setTimeFilter(option.value as TimeFilter)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          timeFilter === option.value
                            ? "bg-green-600 text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Status */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      Order Status
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "all", label: "All Status" },
                      { value: "processing", label: "Processing" },
                      { value: "delivered", label: "Delivered" },
                      { value: "cancelled", label: "Cancelled" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setStatusFilter(option.value as StatusFilter)
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === option.value
                          ? "bg-green-600 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Branch */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-800">
                      Branch
                    </span>
                  </div>
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    className="w-full bg-neutral-100 rounded-lg px-4 py-2.5 text-sm font-medium 
                    text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900
                    hover:bg-neutral-200 cursor-pointer appearance-none"
                    disabled={isLoadingBranches}
                  >
                    <option value="">All Branches</option>
                    {availableBranches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, index) => <OrderSkeleton key={index} />)
            ) : filteredOrders.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-5">
                <div className="w-full max-w-[280px] mx-auto text-center">
                  <img
                    src="/not-found.png"
                    alt="No orders found"
                    className="w-full h-auto mb-6"
                  />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No Orders Found
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {timeFilter !== "all" ||
                    statusFilter !== "all" ||
                    selectedBranchFilter
                      ? "Try changing your filters or broadening your search criteria"
                      : "You haven't placed any orders yet. Once you do, they'll appear here!"}
                  </p>
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:shadow-green-100/50 
                  hover:border-green-100 transition-all duration-200 relative flex flex-col"
                >
                  {/* Order Header */}
                  <div className="p-4 flex justify-between items-start border-b border-gray-100 bg-gradient-to-r from-green-50/50 to-white">
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(order.createdAt),
                          "MMM d, yyyy • h:mm a"
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                          : order.status === "processing"
                          ? "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200"
                          : "bg-red-100 text-red-800 group-hover:bg-red-200"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Order Content */}
                  <div className="p-4 space-y-4 flex-1 bg-white">
                    {/* Products */}
                    <div className="space-y-3">
                      {order.products.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-start group/item hover:bg-green-50/30 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 group-hover/item:text-green-600 transition-colors">
                              {item.quantity}x {item.product.name}
                            </p>
                            {item.selectedAttributes.map((attr, i) => (
                              <p key={i} className="text-sm text-gray-500">
                                {attr.name}: {attr.value}
                              </p>
                            ))}
                          </div>
                          <p className="font-medium text-gray-900">
                            £{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery/Pickup Info */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 rounded-lg p-3">
                        {order.orderType === "delivery" ? (
                          <>
                            <Truck size={18} className="text-green-600" />
                            <span className="text-sm">
                              Delivery to: {order.deliveryAddress?.street},{" "}
                              {order.deliveryAddress?.city}
                            </span>
                          </>
                        ) : (
                          <>
                            <MapPin size={18} className="text-green-600" />
                            <span className="text-sm">
                              Pickup from: {order.branchId.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Total Section */}
                  <div className="mt-auto p-4 bg-emerald-50/50 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-black text-lg">
                        £{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Add this at the top of your file with other styles
const styles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;

// Add this style tag to your component
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default OrdersPage;
