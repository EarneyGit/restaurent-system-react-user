import React, { useEffect, useState } from 'react';

interface AnimatedTitleProps {
  onAnimationComplete: () => void;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ onAnimationComplete }) => {
  const text = "RESTROMEN";
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(animationInterval);
        setTimeout(() => {
          setIsAnimating(false);
          onAnimationComplete();
        }, 500);
      }
    }, 300);

    return () => clearInterval(animationInterval);
  }, [onAnimationComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-1000 ${
        !isAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#f8f9fa'
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Background SVG Animations */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient for elements */}
            <linearGradient id="foodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#388e3c" stopOpacity="0.2" />
            </linearGradient>

            {/* Chef Hat Pattern */}
            <pattern id="chefHatPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M10 2C6 2 3 5 3 8c0 2 1 3.5 3 4.5V14h8v-1.5c2-1 3-2.5 3-4.5 0-3-3-6-7-6z"
                fill="url(#foodGradient)"
                opacity="0.2"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 0 1; 0 0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>

            {/* Utensils Pattern */}
            <pattern id="utensilsPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M15 5v15M10 8v9M20 8v9M13 25h4"
                stroke="url(#foodGradient)"
                strokeWidth="1"
                opacity="0.15"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 15 15; 10 15 15; 0 15 15"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>

            {/* Delivery Bike Pattern */}
            <pattern id="bikePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M30 20c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-20 0c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z"
                fill="url(#foodGradient)"
                opacity="0.2"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 2 0; 0 0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </pattern>
          </defs>

          {/* Background Rectangles with Patterns */}
          <rect width="100%" height="100%" fill="url(#chefHatPattern)" />
          <rect width="100%" height="100%" fill="url(#utensilsPattern)" />
          <rect width="100%" height="100%" fill="url(#bikePattern)" />

          {/* Animated Food Elements */}
          <g>
            {/* Plate */}
            <circle cx="20" cy="30" r="8" fill="none" stroke="#2e7d32" strokeWidth="0.5" opacity="0.3">
              <animate
                attributeName="r"
                values="8;8.5;8"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Steam Effect */}
            <path
              d="M18 20q2-2 4 0"
              stroke="#388e3c"
              strokeWidth="0.5"
              fill="none"
              opacity="0.2"
            >
              <animate
                attributeName="d"
                values="M18 20q2-2 4 0;M18 20q2-3 4 0;M18 20q2-2 4 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>

            {/* Delivery Box */}
            <rect x="70" y="60" width="10" height="10" fill="#2e7d32" opacity="0.2">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; -2 -2; 0 0"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
          </g>
        </svg>

        {/* Text Animation */}
        <div className="relative z-10">
          <h1 className="md:text-7xl text-4xl font-mono font-bold tracking-wider">
            {text.split('').map((letter, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-500 ${
                  index < displayText.length
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-16 scale-50'
                }`}
                style={{
                  textShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
                  color: '#1b5e20',
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTitle; 