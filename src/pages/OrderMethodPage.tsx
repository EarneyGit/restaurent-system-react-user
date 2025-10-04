import { ShoppingBag, Truck, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBranch } from "@/context/BranchContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
  
interface BranchDetails {
  id: string;
  name: string;
  aboutUs: string;
  email: string;
  contactNumber: string;
  telephone?: string;
  address: {
    street: string;
    addressLine2?: string;
    city: string;
    county?: string;
    state: string;
    postcode: string;
    country: string;
  };
  orderingTimes: {
    weeklySchedule: {
      [key: string]: DaySchedule;
    };
    closedDates: Array<{
      date: string;
      type: string;
      endDate?: string;
      reason: string;
      _id?: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
  };
  orderingOptions: {
    collection: {
      displayFormat: string;
      timeslotLength: number;
      isEnabled: boolean;
    };
    delivery: {
      displayFormat: string;
      timeslotLength: number;
      isEnabled: boolean;
    };
    tableOrdering: {
      isEnabled: boolean;
    };
  };
  preOrdering: {
    allowCollectionPreOrders: boolean;
    allowDeliveryPreOrders: boolean;
  };
}

const OrderMethodPage = () => {
  const navigate = useNavigate();
  const [branchDetails, setBranchDetails] = useState<BranchDetails[]>([]);

  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?.id;

  const branch = branchDetails[0];
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = daysOfWeek[new Date().getDay()];
  const todaySchedule = branch?.orderingTimes?.weeklySchedule?.[today];

  const isCollectionAllowed = todaySchedule?.isCollectionAllowed ?? false;
  const isDeliveryAllowed = todaySchedule?.isDeliveryAllowed ?? false;
  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = branchId
          ? await axios.get(`/api/branches/public-outlet-settings/${branchId}`)
          : await axios.get("/api/branches/public-outlet-settings");

        if (response.data?.success) {
          if (branchId) {
            setBranchDetails([response.data.data]);
          } else {
            setBranchDetails(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
        toast.error("Failed to load branch details");
      }
    };

    fetchBranchDetails();
  }, [branchId]);

  useEffect(() => {
    // Check if a branch is selected
    if (!selectedBranch) {
      navigate("/select-outlet");
      return;
    }
  }, [selectedBranch, navigate]);

  const handleMethodSelect = (method: "collect" | "deliver") => {
    if (!selectedBranch) {
      navigate("/select-outlet");
      return;
    }

    localStorage.setItem("deliveryMethod", method);

    // Store branch information
    localStorage.setItem("selectedBranchId", selectedBranch.id);

    if (method === "deliver") {
      navigate("/delivery-address");
    } else {
      // For collection, store branch address
      localStorage.setItem(
        "collectionAddress",
        JSON.stringify({
          fullAddress: selectedBranch.address,
          postcode: selectedBranch.address.postalCode,
        })
      );

      // Navigate to app route with branch ID
      navigate(`/app?branchId=${selectedBranch.id}`);
    }
  };

  if (!selectedBranch) {
    return null; // Prevent rendering while redirecting
  }

  const ServiceOptionsSection = ({ branch }: { branch: BranchDetails }) => {
    if (!branch.orderingOptions) {
      return (
        <div className="text-center py-8 bg-white/5 rounded-xl">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">No service information available</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/select-outlet")}
          className="absolute top-4 left-4 px-4 py-2 font-semibold rounded-md border border-white/20 flex items-center space-x-1 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base uppercase">Back</span>
        </button>

        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center mb-8 md:pt-0 pt-10">
            <h1 className="md:text-3xl text-2xl font-bold text-white mb-4">
              How would you like to receive your order?
            </h1>
            <p className="text-white/70 text-lg">
              Choose your preferred delivery method for {selectedBranch.name}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-6">
            {/* Collection Option */}
            <button
              onClick={() => handleMethodSelect("collect")}
              disabled={!isCollectionAllowed}
              className={`w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transition-all group 
            ${
              isCollectionAllowed
                ? "hover:bg-white/20 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            >
              <div className="flex items-center">
                <div className="bg-yellow-200/80 p-4 rounded-xl">
                  <ShoppingBag className="text-yellow-700 w-8 h-8" />
                </div>
                <div className="ml-5 text-left">
                  <h3 className="font-bold text-xl text-white">I'll collect</h3>
                  <p className="text-white/70 mt-1.5">
                    Pick up your order from {selectedBranch.name}
                  </p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mr-2.5 ${
                        isCollectionAllowed ? "bg-yellow-600" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm text-white/70">
                      {isCollectionAllowed
                        ? "Ready in 15-20 mins"
                        : "Not available today"}
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Delivery Option */}
            <button
              onClick={() => handleMethodSelect("deliver")}
              disabled={!isDeliveryAllowed}
              className={`w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transition-all group 
            ${
              isDeliveryAllowed
                ? "hover:bg-white/20 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
            >
              <div className="flex items-center">
                <div className="bg-yellow-200/80 p-4 rounded-xl">
                  <Truck className="text-yellow-700 w-8 h-8" />
                </div>
                <div className="ml-5 text-left">
                  <h3 className="font-bold text-xl text-white">
                    Deliver to me
                  </h3>
                  <p className="text-white/70 mt-1.5">
                    Get your order delivered from {selectedBranch.name}
                  </p>
                  <div className="flex items-center mt-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full mr-2.5 ${
                        isDeliveryAllowed ? "bg-yellow-600" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="text-sm text-white/70">
                      {isDeliveryAllowed
                        ? "Delivery in 30-45 mins"
                        : "Not available today"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderMethodPage;
