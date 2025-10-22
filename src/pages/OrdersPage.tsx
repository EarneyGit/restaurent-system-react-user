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
import { API_BASE_URL, ORDER_ENDPOINTS } from "@/config/api.config";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  OrderStatus,
  OrderStatusType,
  getStatusColor,
  getStatusIcon,
} from "@/types/order.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Address } from "../types/branch.types";

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
    attributeId: string;
    attributeName: string;
    attributeType: string;
    selectedItems: Array<{
      itemId: string;
      itemName: string;
      itemPrice: number;
      quantity: number;
      _id?: string;
      id?: string;
    }>;
    _id?: string;
    id?: string;
  }>;
}
interface CustomerDetails {
  address: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  branchId: {
    _id: string;
    name: string;
    address: Address;
  };
  products: Product[];
  status: OrderStatusType;
  totalAmount: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: "card" | "cash";
  deliveryMethod: "delivery" | "collection";
  orderCustomerDetails: CustomerDetails;
  createdAt: string;
  updatedAt: string;
}

type TimeFilter = "all" | "today" | "week" | "month";
type StatusFilter = "all" | OrderStatusType;

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

// Helper function to get delivery method safely
const getDeliveryMethod = (order: Order | null) => {
  const method =
    typeof order?.deliveryMethod === "string" && order.deliveryMethod
      ? order.deliveryMethod
      : null;
  return method
    ? method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ")
    : "N/A";
};

// Helper to format address object
const formatAddress = (address: Address | string | undefined) => {
  if (!address || typeof address === "string") return address || "";
  return [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const ORDERS_PER_PAGE = 8;

  const { isAuthenticated, token } = useAuth();

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoadingBranches(true);
        const API_URL = API_BASE_URL;
        const response = await axios.get(`${API_URL}/api/branches`);
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

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Update the status filter options
  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: OrderStatus.PENDING, label: "Pending" },
    { value: OrderStatus.PROCESSING, label: "Processing" },
    { value: OrderStatus.COMPLETED, label: "Completed" },
    { value: OrderStatus.CANCELLED, label: "Cancelled" },
  ];

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, selectedBranchFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">My Orders</h1>
            <div className="flex gap-4 items-center">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              >
                {statusFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Branch Filter */}
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-600"
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
          <div className=" bg-white rounded-xl shadow border border-gray-200">
            <div className="overflow-x-auto w-full">
              <table className="min-w-[800px] md:min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[180px] md:w-auto">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Delivery Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-yellow-50/30 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                          {format(
                            new Date(order.createdAt),
                            "MMM d, yyyy • h:mm a"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status === OrderStatus.COMPLETED
                              ? "Completed"
                              : order.status === OrderStatus.PROCESSING
                              ? "Processing"
                              : order.status === OrderStatus.PENDING
                              ? "Pending"
                              : order.status === OrderStatus.CANCELLED
                              ? "Cancelled"
                              : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 capitalize whitespace-nowrap">
                          {getDeliveryMethod(order)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-black whitespace-nowrap">
                          £{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setModalOrder(order)}
                            className="px-4 py-2 bg-yellow-700 md:text-base text-sm text-white rounded-lg font-medium hover:bg-yellow-700 transition"
                          >
                            Show Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6 text-sm">
              {/* Prev button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded font-medium border border-gray-300 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Prev
              </button>

              {/* First page */}
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-yellow-700 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    1
                  </button>
                  {currentPage > 3 && <span className="px-2">...</span>}
                </>
              )}

              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) => page >= currentPage - 1 && page <= currentPage + 1 // show 1 before and 1 after
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${
                      currentPage === page
                        ? "bg-yellow-700 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Last page */}
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-2 rounded ${
                      currentPage === totalPages
                        ? "bg-yellow-700 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next button */}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded font-medium border border-gray-300 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          {/* Order Details Modal */}
          {modalOrder && (
            <Dialog
              open={!!modalOrder}
              onOpenChange={(open) => !open && setModalOrder(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Order #:</span>
                    <span>{modalOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Date:</span>
                    <span>
                      {format(
                        new Date(modalOrder.createdAt),
                        "MMM d, yyyy • h:mm a"
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        modalOrder.status
                      )}`}
                    >
                      {modalOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Delivery Method:</span>
                    <span className="capitalize">
                      {getDeliveryMethod(modalOrder)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">
                      £{modalOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Branch</h3>
                  <div className="text-sm text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline-block mb-0.5 text-yellow-700 mr-1" />
                    {modalOrder.branchId.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {String(formatAddress(modalOrder.branchId.address))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Products</h3>
                  <ul className="divide-y divide-gray-100">
                    {modalOrder?.products?.map((item, idx) => (
                      <li key={idx} className="py-2">
                        <div className="flex justify-between">
                          <span>
                            {item.quantity}x {item.product.name}
                          </span>
                          <span>
                            £{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Selected Attributes */}
                        {item.selectedAttributes &&
                          item.selectedAttributes.length > 0 && (
                            <ul className="ml-4 mt-1 text-xs text-gray-500">
                              {item.selectedAttributes.map((attr, i) => (
                                <li key={i} className="mb-1">
                                  <span className="font-medium text-sm mt-2 text-gray-700">
                                    {attr?.attributeName}:
                                  </span>
                                  <ul className="ml-3 text-sm list-disc">
                                    {attr?.selectedItems?.map((sel, j) => (
                                      <li key={j}>
                                        {sel.quantity}x {sel.itemName}
                                        {sel.itemPrice !== undefined && (
                                          <span className="ml-2 text-yellow-700">
                                            £{Number(sel.itemPrice).toFixed(2)}
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>
                {modalOrder.deliveryMethod === "delivery" &&
                  modalOrder.orderCustomerDetails && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Delivery Address</h3>
                      <div className="text-sm text-gray-700">
                        {/* {modalOrder.deliveryAddress.street},{" "}
                        {modalOrder.deliveryAddress.city},{" "}
                        {modalOrder.deliveryAddress.state},{" "}
                        {modalOrder.deliveryAddress.postalCode} */}
                        {modalOrder?.orderCustomerDetails?.address || ""}
                      </div>
                    </div>
                  )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setModalOrder(null)}
                    className="px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
