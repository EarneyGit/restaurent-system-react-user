import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-12 flex flex-col">
        {/* Logo */}
        <div className="flex px-6 py-6">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-foodyman-lime to-foodyman-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="ml-2 uppercase font-mono  font-semibold text-2xl md:block hidden text-gray-800">
                Restroman
              </span>
            </Link>
          </div>   

        {/* Login Form */}
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">
            Don't have an account? <Link to="/register" className="text-foodyman-lime hover:text-foodyman-lime/70 transition-colors">Sign up</Link>
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs uppercase font-medium text-gray-500 mb-2">
                Email or phone
              </label>
              <input 
                id="email" 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type here" 
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-foodyman-lime focus:border-transparent" 
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs uppercase font-medium text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type here" 
                  className="w-full border border-gray-300 rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-foodyman-lime focus:border-transparent" 
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded accent-foodyman-lime" 
                />
                <span className="ml-2 text-sm text-gray-600">Keep me logged in</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-foodyman-lime transition-colors">
                Forgot password
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-foodyman-lime text-white font-medium py-3 rounded-md hover:bg-foodyman-lime/70 transition-colors"
            >
              Login
            </button>
          </form>
          
          {/* Demo credentials */}
          <div className="mt-8 text-sm text-gray-500">
            <p>user@githubit.com</p>
            <p className="flex justify-between">
              <span>githubit</span>
              <button className="text-foodyman-lime hover:text-foodyman-lime/70 transition-colors">Copy</button>
            </p>
          </div>
          
          {/* Separator */}
          <div className="my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-sm text-gray-500">or access quickly</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          {/* Social login */}
          <div className="grid grid-cols-3 gap-3">
            <button className="border border-gray-200 rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="#A3A3A3"/>
                <path d="M14.5 8.5H16.5L13 13.5H11L14.5 8.5Z" fill="white"/>
                <path d="M9.5 8.5H11.5L8 13.5H6L9.5 8.5Z" fill="white"/>
              </svg>
              <span className="ml-2">Apple</span>
            </button>
            <button className="border border-gray-200 rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4267B2" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.7037 22H7.54074V13H4.59259V8.93333H7.54074V5.93333C7.54074 3.13333 9.18519 1 12.4444 1C13.5556 1 14.837 1.2 14.837 1.2V4H13.3333C11.9259 4 11.4074 4.93333 11.4074 6V8.93333H14.6667L14.1481 13H11.4074V22H12.7037Z"/>
              </svg>
              <span className="ml-2">Facebook</span>
            </button>
            <button className="border border-gray-200 rounded-md py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.06 11.023c0-.8-.071-1.57-.205-2.309H12.217v4.362h5.534a4.723 4.723 0 01-2.054 3.107v2.553h3.317c1.94-1.782 3.046-4.404 3.046-7.713z" fill="#4285F4"/>
                <path d="M12.217 22c2.773 0 5.098-.918 6.795-2.465l-3.317-2.553c-.92.619-2.1.976-3.478.976-2.67 0-4.929-1.8-5.734-4.221H2.987v2.634A10.198 10.198 0 0012.217 22z" fill="#34A853"/>
                <path d="M6.482 13.737a6.15 6.15 0 01-.32-1.96c0-.68.116-1.342.32-1.96V7.183H2.987A10.193 10.193 0 002 11.777c0 1.646.394 3.21 1.096 4.594l3.386-2.634z" fill="#FBBC05"/>
                <path d="M12.217 5.596c1.507 0 2.858.517 3.926 1.535l2.939-2.923C17.273 2.467 14.948 1.5 12.217 1.5a10.198 10.198 0 00-9.23 5.683l3.497 2.7c.804-2.422 3.063-4.287 5.733-4.287z" fill="#EA4335"/>
              </svg>
              <span className="ml-2">Google</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Right side - Image with overlay and content */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-gray-100 relative">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-10"></div>
        <img 
          src="/delivery-courier.jpg"
          alt="Delivery courier" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-start z-20 p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6">Experience Premium Food Delivery</h2>
            <p className="text-white/90 text-lg mb-8">
              Restroman brings your favorite restaurants to your doorstep. Enjoy fast delivery, exclusive discounts, and a seamless ordering experience.
            </p>
            <ul className="space-y-3 text-white/90 mb-8">
              <li className="flex items-center">
                <span className="w-6 h-6 bg-foodyman-lime rounded-full flex items-center justify-center mr-3">✓</span>
                <span>Order from premium restaurants near you</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-foodyman-lime rounded-full flex items-center justify-center mr-3">✓</span>
                <span>Fast delivery within 30 minutes</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 bg-foodyman-lime rounded-full flex items-center justify-center mr-3">✓</span>
                <span>Easy ordering process with real-time tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 