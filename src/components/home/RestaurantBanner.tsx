import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const RestaurantBanner = () => {
  const navigate = useNavigate();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrderNow = async () => {
    setIsOrdering(true);
    try {
      await navigator.clipboard.writeText("WELCOME20");
      toast.success("Promo code copied!", {
        description: "Use WELCOME20 at checkout for 20% off",
        duration: 3000,
      });
    } catch (error) {
      // Fallback for clipboard error
      toast("Promo Code: WELCOME20", {
        description: "Please copy the code manually",
        duration: 5000,
      });
      console.error("Clipboard error:", error);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0A1A2F] py-12 rounded-xl">
      {/* World Map Network Image */}
      <div className="absolute top-0 right-0 w-[600px] h-full opacity-20">
        <img 
          src="/images/world-network.jpg" 
          alt="World Network"
          className="w-full h-full object-cover mix-blend-lighten"
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-gray-700 rounded-lg text-sm font-medium tracking-wide uppercase text-white mb-4">
            Limited Time Offer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get 20% Off Your First Order
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Use code{" "}
            <span 
              className="text-yellow-600 font-semibold cursor-pointer" 
              onClick={handleOrderNow}
              role="button"
              tabIndex={0}
            >
              WELCOME20
            </span>{" "}
            at checkout
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleOrderNow}
              disabled={isOrdering}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all transform  disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              <Copy size={20} />
              Copy Promo Code
            </button>
            <button
              onClick={() => navigate("/app/products/All")}
              className="border border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded-lg font-medium transition-all transform "
            >
              View Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBanner;
