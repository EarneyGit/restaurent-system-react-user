import React, { useEffect, useState, useCallback, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/services/api";
import {
  ShoppingBag,
  Clock,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import axios from "@/config/axios.config";
import { useBranch } from "@/context/BranchContext";

interface ProductGridProps {
  category: string;
  filters: string[];
  onProductCountUpdate?: (count: number) => void;
  branchId?: string;
}

interface BranchAvailability {
  available: boolean;
  reason: string;
}

const ProductGrid: React.FC<ProductGridProps> = React.memo(
  ({ category, filters, onProductCountUpdate, branchId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLoadingState, setShowLoadingState] = useState(true);

    const [branchAvailability, setBranchAvailability] = useState<{
      delivery: BranchAvailability;
      collection: BranchAvailability;
    }>({
      delivery: { available: false, reason: "" },
      collection: { available: false, reason: "" },
    });

    const [isBranchAvailable, setIsBranchAvailable] = useState<boolean>(true);
    const [closedReason, setClosedReason] = useState<string | null>(null);

    const { selectedBranch } = useBranch();

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 20;

    // 🚨 Delivery method from localStorage
    const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
    const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
    const [canOrder, setCanOrder] = useState(true);

    useEffect(() => {
      const method = localStorage.getItem("deliveryMethod");
      setDeliveryMethod(method);
    }, []);

    // ✅ Check closedDates
    const checkClosedDates = useCallback((branch: any) => {
      if (!branch?.orderingTimes?.closedDates) return false;

      const todayStr = new Date().toISOString().split("T")[0];

      const closedToday = branch.orderingTimes.closedDates.find((d: any) => {
        return d.date.split("T")[0] === todayStr;
      });

      if (closedToday) {
        setClosedReason(closedToday.reason || "Closed Today");
        setIsBranchAvailable(false);
        return true;
      }
      return false;
    }, []);

    // ✅ Check availability API
    const checkBranchAvailability = useCallback(async (branchId: string) => {
      try {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split("T")[0];
        const formattedTime = currentDate.toTimeString().slice(0, 5);

        const [deliveryRes, collectionRes] = await Promise.all([
          axios.post(`/api/ordering-times/${branchId}/check-availability`, {
            orderType: "delivery",
            date: formattedDate,
            time: formattedTime,
          }),
          axios.post(`/api/ordering-times/${branchId}/check-availability`, {
            orderType: "collection",
            date: formattedDate,
            time: formattedTime,
          }),
        ]);

        const delivery = deliveryRes.data;
        const collection = collectionRes.data;

        setBranchAvailability({
          delivery: {
            available: delivery?.available ?? false,
            reason: delivery?.reason || "Delivery not available",
          },
          collection: {
            available: collection?.available ?? false,
            reason: collection?.reason || "Collection not available",
          },
        });

        setIsBranchAvailable(delivery?.available || collection?.available);
      } catch (error) {
        console.error("Error checking branch availability:", error);
        setBranchAvailability({
          delivery: { available: false, reason: "Error checking delivery" },
          collection: { available: false, reason: "Error checking collection" },
        });
        setIsBranchAvailable(false);
      }
    }, []);

    // ✅ Fetch products
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setShowLoadingState(true);
          setError(null);

          if (!branchId || !selectedBranch) {
            setProducts([]);
            onProductCountUpdate?.(0);
            return;
          }

          checkClosedDates(selectedBranch);

          await checkBranchAvailability(branchId);

          const response = await axios.get("/api/products", {
            params: { branchId },
          });

          if (response.data?.success) {
            let filteredProducts = response.data.data.filter(
              (product: Product) => !product.hideItem
            );

            if (category !== "All") {
              filteredProducts = filteredProducts.filter((product: Product) => {
                const productCategory = product.category;
                if (
                  typeof productCategory === "object" &&
                  productCategory !== null
                ) {
                  return productCategory.name === category;
                }
                return String(productCategory) === category;
              });
            }

            setProducts(filteredProducts);
            onProductCountUpdate?.(filteredProducts.length);
          } else {
            setError("Failed to load products");
            setProducts([]);
            onProductCountUpdate?.(0);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          setError("Failed to load products");
          setProducts([]);
          onProductCountUpdate?.(0);
        } finally {
          setTimeout(() => {
            setLoading(false);
            setShowLoadingState(false);
          }, 500);
        }
      };

      fetchProducts();
    }, [
      category,
      filters,
      branchId,
      onProductCountUpdate,
      checkBranchAvailability,
      checkClosedDates,
      selectedBranch,
    ]);

    useEffect(() => {
      if (!deliveryMethod) return;

      if (deliveryMethod === "deliver" && !branchAvailability.delivery.available) {
        setAvailabilityMessage(branchAvailability.delivery.reason || "Delivery is not available right now.");
        setCanOrder(false);
      } else if ((deliveryMethod === "collect" || deliveryMethod === "pickup") && !branchAvailability.collection.available) {
        setAvailabilityMessage(branchAvailability.collection.reason || "Collection is not available right now.");
        setCanOrder(false);
      } else {
        setAvailabilityMessage(null);
        setCanOrder(true);
      }
    }, [deliveryMethod, branchAvailability]);

    // ✅ Apply filters
    const filteredProducts = useMemo(() => {
      if (filters.length === 0) return products;
      return products.filter((product) =>
        filters.every((filter) =>
          product.tags?.some((tag) =>
            tag.toLowerCase().includes(filter.toLowerCase())
          )
        )
      );
    }, [products, filters]);

    // ✅ Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLast = currentPage * productsPerPage;
    const indexOfFirst = indexOfLast - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);

    const handlePageChange = (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    useEffect(() => {
      setCurrentPage(1);
    }, [category, filters]);

    // ✅ Loading skeleton
    const LoadingSkeleton = useMemo(
      () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-xl mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-gray-100 rounded-full w-20"></div>
                  <div className="h-8 bg-gray-100 rounded-full w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
      []
    );

    if (showLoadingState) return LoadingSkeleton;

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error Loading Products
          </h3>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    return (
      <>
        {/* 🚨 Closed Today */}
        {closedReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">
                  Outlet Closed Today
                </h3>
                <p className="text-red-700 text-sm">{closedReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🚨 Outlet unavailable */}
        {!closedReason && !isBranchAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">
                  Outlet Currently Unavailable
                </h3>
                <p className="text-red-700 text-sm">
                  Both Delivery and Collection are unavailable at this time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 🚨 Method not available */}
        {availabilityMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-red-500" />
              <div>
                <h3 className="font-medium text-red-900">Service Unavailable</h3>
                <p className="text-red-700 text-sm">{availabilityMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🛒 Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-[#e8f5e9] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-[#4caf50]" />
            </div>
            <h3 className="text-lg font-medium text-[#2e7d32] mb-2">
              No Products Available
            </h3>
            <p className="text-[#4caf50]">
              {category === "All"
                ? "No products available at the moment"
                : `No products found in ${category}`}
            </p>
            {filters.length > 0 && (
              <p className="text-sm text-[#4caf50] mt-2">
                Try adjusting your filters
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBranchAvailable={!closedReason && isBranchAvailable}
                  disableAddToCart={!canOrder}
                />
              ))}
            </div>

            {/* ✅ Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 pt-32">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 flex font-semibold text-sm items-center justify-center rounded-lg border ${
                              currentPage === page
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Displaying{" "}
                  <span className="font-medium">
                    {Math.min(
                      productsPerPage,
                      filteredProducts.length - indexOfFirst
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  products
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
