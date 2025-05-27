import React from "react";
import { ArrowUpRight, Salad, UtensilsCrossed, ChefHat } from "lucide-react";

const bannerData = [
  {
    title: "Healthy & Fresh\nFood Delivery",
    description: "Get fresh, healthy meals delivered to your doorstep. Perfect for busy professionals.",
    // buttonText: "View menu",
    icon: <Salad className="w-12 h-12 text-white" />,
    bgColor: "bg-gradient-to-br from-green-500 to-green-600",
    iconBg: "bg-green-600/50 backdrop-blur-md",
    pattern: (id) => (
      <svg width="100%" height="100%" className="text-white/[0.1]">
        <defs>
          <pattern id={`healthy-pattern-${id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="2" fill="currentColor"/>
            <circle cx="20" cy="20" r="1" fill="currentColor"/>
            <circle cx="40" cy="40" r="2" fill="currentColor"/>
            <circle cx="0" cy="0" r="2" fill="currentColor"/>
            <circle cx="40" cy="0" r="2" fill="currentColor"/>
            <circle cx="0" cy="40" r="2" fill="currentColor"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#healthy-pattern-${id})`} />
      </svg>
    )
  },
  {
    title: "Express Delivery\nin 30 Minutes",
    description: "Hot and fresh food delivered quickly. Satisfaction guaranteed on every order.",
    // buttonText: "Order now",
    icon: <UtensilsCrossed className="w-12 h-12 text-white" />,
    bgColor: "bg-gradient-to-br from-gray-800 to-gray-900",
    iconBg: "bg-gray-800/50 backdrop-blur-md",
    pattern: (id) => (
      <svg width="100%" height="100%" className="text-white/[0.06]">
        <defs>
          <pattern id={`delivery-pattern-${id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20h40M20 0v40" strokeWidth="0.5" stroke="currentColor"/>
            <circle cx="20" cy="20" r="1.5" fill="currentColor"/>
            <circle cx="0" cy="0" r="1" fill="currentColor"/>
            <circle cx="40" cy="40" r="1" fill="currentColor"/>
            <circle cx="0" cy="40" r="1" fill="currentColor"/>
            <circle cx="40" cy="0" r="1" fill="currentColor"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#delivery-pattern-${id})`} />
      </svg>
    )
  },
  {
    title: "Premium Dining\nExperience",
    description: "Exclusive restaurants and special offers for premium members.",
    // buttonText: "Join now",
    icon: <ChefHat className="w-12 h-12 text-white" />,
    bgColor: "bg-gradient-to-br from-green-700 to-green-800",
    iconBg: "bg-green-800/50 backdrop-blur-md",
    pattern: (id) => (
      <svg width="100%" height="100%" className="text-white/[0.05]">
        <defs>
          <pattern id={`premium-pattern-${id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0l5 15L50 17l-12 11 3 16-11-7-11 7 3-16-12-11 15-2z" fill="currentColor"/>
            <circle cx="30" cy="30" r="2" fill="currentColor"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#premium-pattern-${id})`} />
      </svg>
    )
  }
];

const PromotionalBanners = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:mt-14 mt-10 pb-7">
      {bannerData.map((banner, index) => (
        <div 
          key={index}
          className={`group relative overflow-hidden rounded-3xl ${banner.bgColor} hover:shadow-xl transition-all duration-300`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0">
            {banner.pattern(index)}
          </div>

          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[1px]" />
          
          <div className="absolute top-4 right-4 z-20">
            <button className="bg-white/90 backdrop-blur-sm text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:gap-3 transition-all hover:bg-white group-hover:shadow-lg">
              {banner.buttonText}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-6 pt-16 pb-8 relative h-[250px] flex flex-col z-10">
            {/* Content Container */}
            <div className="max-w-[70%]">
              <h2 className="md:text-2xl text-xl font-bold text-white mb-3 whitespace-pre-line">
                {banner.title}
              </h2>
              <p className="text-white/90 font-semibold text-sm leading-relaxed">
                {banner.description}
              </p>
            </div>
            
            {/* Icon Container with Glass Effect */}
            <div className={`absolute bottom-6 right-6 ${banner.iconBg} p-4 rounded-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:translate-x-2 border border-white/10 shadow-lg`}>
              {banner.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromotionalBanners;
