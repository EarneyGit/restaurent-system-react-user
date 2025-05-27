  import React, { useEffect, useState } from 'react';
  import { X, Gift, Loader2, Clipboard } from 'lucide-react';
  import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

  const staticOffers = [
    {
      id: 'offer1',
      code: 'FIRST20',
      title: '20% Off on Your First Order',
      description: 'Enjoy a special 20% discount when placing your first order with us.',
      discount: 20,
      validTill: '2025-06-30',
    },
    {
      id: 'offer2',
      code: 'B1G1FREE',
      title: 'Buy 1 Get 1 Free',
      description: 'Order any two items and get one absolutely free. Limited time only!',
      discount: 50,
      validTill: '2025-07-15',
    },
    {
      id: 'offer3',
      code: 'WEEKEND25',
      title: 'Weekend Combo Deal',
      description: 'Grab your favorite weekend combos at an amazing price.',
      discount: 25,
      validTill: '2025-08-10',
    },
    {
      id: 'offer4',
      code: 'FREEDEL500',
      title: 'Free Delivery Over £500',
      description: 'No delivery charges on the orders above £500.',
      discount: 100,
      validTill: '2025-09-01',
    },
  ];


  const OfferPage = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState<typeof staticOffers>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
      setTimeout(() => {
        setOffers(staticOffers);
        setIsLoading(false);
      }, 100);
    }, []);

    const copyToClipboard = (code: string) => {
      navigator.clipboard.writeText(code).then(() => {
        toast.success(`Copied offer code "${code}".`);
      });
    };
    

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 size={40} className="text-green-500 animate-spin" />
        </div>
      );
    }

    return (
      <div className="min-h-screen relative xl:pt-10 md:pt-5 pt-3 font-sans">
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
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Latest Offers</h1>
            <p className="text-white/80 text-lg">Explore the best deals and discounts available now</p>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-colors group"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-600/20">
                      <Gift size={24} className="text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{offer.title}</h3>
                      <p className="text-white/70 mb-3">{offer.description}</p>
                      {/* <p className="text-sm text-green-500 font-medium mb-3">
                        {offer.discount}% OFF • Valid till {offer.validTill}
                      </p> */}
                      <p className="text-white/90 font-mono bg-white/10 inline-block px-2 py-1 rounded select-all mb-4">
                        Code: <span className="font-semibold">{offer.code}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(offer.code)}
                    className="mt-6 w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                    aria-label={`Copy offer code ${offer.code}`}
                  >
                    <Clipboard size={20} /> Copy Offer Code
                  </button>
                </div>
              </div>
            ))}
          </div>

          {offers.length === 0 && (
            <div className="text-center text-white/70 mt-8">
              No offers available right now. Please check back later.
            </div>
          )}

        </div>
      </div>
    );
  };

  export default OfferPage;
