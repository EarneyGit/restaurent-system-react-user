import { ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderMethodPage = () => {
  const navigate = useNavigate();

  const handleMethodSelect = (method: "collect" | "deliver") => {
    localStorage.setItem("deliveryMethod", method);
    navigate("/app");
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-50 via-foodyman-lime/20 to-green-100">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        // aria-label="Go back"
        className="absolute top-4 left-4 px-4 py-2 font-semibold rounded-md border border-green-900 flex items-center space-x-1 text-foodyman-line  hover:text-foodyman-green transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-base ">Back</span>
      </button>

      {/* Decorative SVG blobs - softly blurred */}
      <svg
        className="absolute top-10 left-0 w-52 h-52 opacity-20 blur-3xl sm:w-72 sm:h-72"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a8e063" />
            <stop offset="100%" stopColor="#56ab2f" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad1)"
          d="M43.5,-64.4C54.7,-55.5,55.9,-39.5,57.5,-26.7C59.1,-13.8,61.1,-4.1,61.4,5.9C61.7,15.9,60.3,25.4,54.5,33.8C48.7,42.3,38.4,49.6,27.6,55.2C16.9,60.8,5.7,64.8,-5.6,68.5C-16.9,72.3,-28.3,75.7,-36.3,70.3C-44.4,64.9,-49,50.8,-53.8,38.4C-58.7,26,-63.8,15.4,-65.7,3.3C-67.6,-8.7,-66.2,-22.6,-59.3,-31.8C-52.4,-41,-40,-45.5,-29.1,-53.6C-18.2,-61.6,-9.1,-73.3,1.3,-75.2C11.7,-77,23.3,-69.4,43.5,-64.4Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg
        className="absolute bottom-12 right-0 w-48 h-48 opacity-15 blur-2xl sm:w-64 sm:h-64"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff416c" />
            <stop offset="100%" stopColor="#ff4b2b" />
          </linearGradient>
        </defs>
        <path
          fill="url(#grad2)"
          d="M42.4,-58.7C54.6,-52,64.8,-42.5,66.3,-32.4C67.9,-22.3,60.8,-11.7,57.3,-2.1C53.8,7.6,53.9,15.2,48.3,22.6C42.6,30,31.1,37.1,21.2,40.3C11.2,43.5,2.8,42.7,-8,45.7C-18.9,48.7,-33.7,55.5,-42,52.8C-50.3,50.1,-52,38.9,-57.1,28.7C-62.1,18.6,-70.5,9.3,-69.1,0.4C-67.7,-8.5,-56.6,-17,-50,-28.8C-43.3,-40.5,-41.2,-55.5,-33.7,-60.8C-26.2,-66.1,-13.1,-61.6,-1.3,-59.8C10.5,-58,21,-58.3,42.4,-58.7Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Logo & Title Section */}
      <div className="flex items-center mb-8 relative z-20">
        <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-base select-none">R</span>
        </div>
        <span className="ml-3 font-semibold text-xl md:block hidden text-gray-900 select-none">
          Restroman
        </span>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full space-y-8 relative z-20">
        {/* Header */}
        <div className="text-center mb-4 px-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight drop-shadow-sm">
            How would you like to receive your order?
          </h1>
        </div>

        {/* Options */}
        <div className="grid gap-6 px-4">
          {/* Collection Option */}
          <button
            onClick={() => handleMethodSelect("collect")}
            className="w-full bg-white backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group border border-transparent shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-foodyman-lime focus:outline-none focus:ring-4 focus:ring-foodyman-lime/40"
            aria-label="Collect order option"
          >
            <div className="flex items-center relative z-10">
              <div className="bg-gradient-to-tr from-green-400 to-foodyman-lime p-4 rounded-xl shadow-lg">
                <ShoppingBag className="text-white w-8 h-8" />
              </div>
              <div className="ml-5 text-left">
                <h3 className="font-extrabold text-xl text-gray-900 tracking-wide">
                  I'LL COLLECT
                </h3>
                <p className="text-gray-700 mt-1.5 text-base max-w-xs">
                  Pick up your order from our outlet
                </p>
                <div className="flex items-center mt-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-foodyman-lime mr-2.5 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Ready in 15-20 mins
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Delivery Option */}
          <button
            onClick={() => handleMethodSelect("deliver")}
            className="w-full bg-white backdrop-blur-md p-5 rounded-2xl relative overflow-hidden group border border-transparent shadow-md hover:shadow-lg transition-shadow duration-300 hover:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-400/40"
            aria-label="Delivery order option"
          >
            <div className="flex items-center relative z-10">
              <div className="bg-gradient-to-tr from-rose-400 to-rose-500 p-4 rounded-xl shadow-lg">
                <Truck className="text-white w-8 h-8" />
              </div>
              <div className="ml-5 text-left">
                <h3 className="font-extrabold text-xl text-gray-900 tracking-wide">
                  DELIVER TO ME
                </h3>
                <p className="text-gray-700 mt-1.5 text-base max-w-xs">
                  Get your order delivered to your location
                </p>
                <div className="flex items-center mt-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 mr-2.5 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Delivery in 30-45 mins
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Allergy Info */}
        <div className="text-center px-6 max-w-md mx-auto mt-10 relative z-20">
          <h2 className="text-base text-gray-900 font-semibold mb-2 tracking-wide">
            DO YOU HAVE A FOOD ALLERGY?
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            If you have a food allergy or intolerance (or someone you're ordering
            for has), please phone the restaurant before ordering.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderMethodPage;
