import React, { useEffect, useState } from "react";
import { X, Gift, Loader2, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { BRANCH_ENDPOINTS } from "@/config/api.config";

const OfferPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [isBranchLoading, setIsBranchLoading] = useState(true);
  const [isOfferLoading, setIsOfferLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // ✅ Fetch all branches
  const fetchBranches = async () => {
    try {
      setIsBranchLoading(true);
      const response = await axios.get(BRANCH_ENDPOINTS.GET_ALL_BRANCHES);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const branchList = response.data.data;
        setBranches(branchList);

        // ✅ Auto-select first branch if available
        if (branchList.length > 0) {
          setSelectedBranch(branchList[0]);
        }
      } else {
        toast.error("Failed to load branches.");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Unable to fetch branches. Please try again later.");
    } finally {
      setIsBranchLoading(false);
    }
  };

  // ✅ Fetch offers for selected branch
  const fetchOffers = async (branchId: string) => {
    try {
      setIsOfferLoading(true);
      setIsError(false);
      const response = await axios.get(`/api/business-offers/active/${branchId}`);
      const { data } = response;

      if (data?.success && Array.isArray(data?.data)) {
        if (data.data.length > 0) {
          setOffers(data.data);
        } else {
          setOffers([]);
        }
      } else {
        throw new Error("Invalid offer response");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setIsError(true);
      setOffers([]);
      toast.error("Failed to load offers. Please try again.");
    } finally {
      setIsOfferLoading(false);
    }
  };

  // ✅ Initial fetch of branches
  useEffect(() => {
    fetchBranches();
  }, []);

  // ✅ Fetch offers when branch changes
  useEffect(() => {
    if (selectedBranch?.id) {
      fetchOffers(selectedBranch.id);
    } else {
      setOffers([]);
    }
  }, [selectedBranch]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success(`Copied offer code "${code}".`))
      .catch(() => toast.error("Failed to copy code"));
  };

  if (isBranchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={40} className="text-yellow-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-10 font-sans">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src="/bg-home.png"
          alt="background"
          className="w-full h-full object-cover opacity-50 blur-sm"
        />
        <div className="absolute inset-0 bg-black/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Latest Offers
          </h1>
          <p className="text-white/80 text-lg mb-6">
            {selectedBranch
              ? `Available offers for ${selectedBranch.name}`
              : "Select a branch to view its offers"}
          </p>

          {/* ✅ Branch Selector */}
          <div className="flex justify-center">
            <select
              className="px-4 py-2 rounded-lg bg-white text-black border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={selectedBranch?.id || ""}
              onChange={(e) => {
                const branch = branches.find((b) => b.id === e.target.value);
                setSelectedBranch(branch || null);
              }}
            >
              {branches.length === 0 && <option>No branches found</option>}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Offers Section */}
        {isOfferLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 size={40} className="text-yellow-600 animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center text-white/80 mt-8">
            <p>Something went wrong while fetching offers.</p>
            <button
              onClick={() => selectedBranch && fetchOffers(selectedBranch.id)}
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-600/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : offers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/10 transition-colors group"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-yellow-200/80">
                      <Gift size={24} className="text-yellow-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {offer.title || "Special Offer"}
                      </h3>
                      <p className="text-white/70 ">
                        {offer.content || "Exclusive deal for you!"}
                      </p>
              
                    </div>
                  </div>

    
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/70 mt-8">
            No offers available right now. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferPage;
