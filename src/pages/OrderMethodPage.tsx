import { ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBranch } from "@/context/BranchContext";
import { useEffect } from "react";

const OrderMethodPage = () => {
  const navigate = useNavigate();
  const { selectedBranch } = useBranch();

  useEffect(() => {
    // Check if a branch is selected
    if (!selectedBranch) {
      navigate('/select-outlet');
      return;
    }
  }, [selectedBranch, navigate]);

  const handleMethodSelect = (method: "collect" | "deliver") => {
    if (!selectedBranch) {
      navigate('/select-outlet');
      return;
    }

    localStorage.setItem("deliveryMethod", method);
    
    // Store branch information
    localStorage.setItem('selectedBranchId', selectedBranch.id);
    
    if (method === "deliver") {
      navigate("/delivery-address");
    } else {
      // For collection, store branch address
      localStorage.setItem('collectionAddress', JSON.stringify({
        fullAddress: selectedBranch.address,
        postcode: selectedBranch.address.postalCode
      }));
      
      // Navigate to app route with branch ID
      navigate(`/app?branchId=${selectedBranch.id}`);
    }
  };

  if (!selectedBranch) {
    return null; // Prevent rendering while redirecting
  }

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
          onClick={() => navigate('/select-outlet')}
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
              className="w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center">
                <div className="bg-green-600/20 p-4 rounded-xl">
                  <ShoppingBag className="text-green-500 w-8 h-8" />
                </div>
                <div className="ml-5 text-left">
                  <h3 className="font-bold text-xl text-white">
                    I'll collect
                  </h3>
                  <p className="text-white/70 mt-1.5">
                    Pick up your order from {selectedBranch.name}
                  </p>
                  <div className="flex items-center mt-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2.5"></div>
                    <span className="text-sm text-white/70">
                      Ready in 15-20 mins
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Delivery Option */}
            <button
              onClick={() => handleMethodSelect("deliver")}
              className="w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center">
                <div className="bg-green-600/20 p-4 rounded-xl">
                  <Truck className="text-green-500 w-8 h-8" />
                </div>
                <div className="ml-5 text-left">
                  <h3 className="font-bold text-xl text-white">
                    Deliver to me
                  </h3>
                  <p className="text-white/70 mt-1.5">
                    Get your order delivered from {selectedBranch.name}
                  </p>
                  <div className="flex items-center mt-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2.5"></div>
                    <span className="text-sm text-white/70">
                      Delivery in 30-45 mins
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
