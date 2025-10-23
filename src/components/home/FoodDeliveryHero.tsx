import { Bike, Clock, MapPin } from 'lucide-react';

export default function FoodDeliveryHero() {
  return (
    <div className="flex flex-col-reverse lg:flex-row items-center justify-between w-full max-w-7xl mx-auto py-12 px-4 lg:px-20 bg-white rounded-xl shadow-lg">
      {/* Left section */}
      <div className="flex-1 flex flex-col items-start gap-6 text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Hungry?<br />
          <span className="text-yellow-600">We’ve Got You Covered 24/7!</span>
        </h1>
        <p className="text-base md:text-lg text-gray-700">
          Order anytime, day or night, and get your favourite meals delivered straight to your doorstep.
          Discover top restaurants and deals near you now!
        </p>
        <div className="flex gap-4 mt-2">
          <button className="bg-yellow-600 text-white py-2 px-6 rounded-full font-semibold shadow hover:bg-yellow-600 transition">
            Order Now
          </button>
          <button className="border border-yellow-600 text-yellow-600 py-2 px-6 rounded-full font-semibold shadow hover:bg-yellow-60 transition">
            Search Restaurants
          </button>
        </div>
      </div>
      {/* Right section */}
      <div className="flex-1 flex flex-col items-center gap-3 relative min-w-[270px] max-w-[370px]">
        {/* City background illustration */}
        <div className="w-full h-40 bg-gray-200 rounded-xl mb-4 flex items-end relative">
          <Bike className="absolute text-yellow-600 left-7 bottom-2 h-24 w-24 drop-shadow-md" />
          {/* Delivery person avatar illustration can be created or imported here */}
          {/* For demo, use Lucide Bike icon as placeholder */}
        </div>
        {/* Floating icons */}
        <Clock className="absolute top-4 right-5 w-10 h-10 text-gray-500 drop-shadow" />
        <MapPin className="absolute top-24 right-2 w-8 h-8 text-yellow-600 drop-shadow" />
      </div>
    </div>
  );
}
