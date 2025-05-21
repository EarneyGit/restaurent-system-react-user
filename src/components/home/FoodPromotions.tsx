import React from 'react';
import { Link } from 'react-router-dom';

interface FoodPromotion {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  backgroundColor: string;
  link: string;
}

const FoodPromotions = () => {
  const promotions: FoodPromotion[] = [
    {
      id: '1',
      title: 'Delicious Handcrafted Pizza',
      subtitle: 'Perfect blend of crispy crust, rich sauce, and premium toppings',
      buttonText: 'Order pizza',
      image: '/restaurant.jpg',
      backgroundColor: 'bg-amber-100',
      link: '/category/pizza'
    },
    {
      id: '2',
      title: 'Fresh & Authentic Sushi and Roll Experience',
      subtitle: 'Indulge in the finest selection of freshly prepared sushi and rolls',
      buttonText: 'Sea food',
      image: '/sushi.png',
      backgroundColor: 'bg-rose-100',
      link: '/category/sushi'
    },
    {
      id: '3',
      title: 'Fresh & Healthy Salad',
      subtitle: 'Refreshing salads made with the freshest ingredients',
      buttonText: 'Order salads',
      image: '/salad.png',
      backgroundColor: 'bg-lime-100',
      link: '/category/salad'
    }
  ];

  return (
    <div className="py-6">
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`min-w-[280px] h-[240px] rounded-lg overflow-hidden relative ${promo.backgroundColor} flex-shrink-0`}
          >
            <div className="p-6 h-full flex flex-col justify-between relative z-10">
              <div>
                <h3 className="text-xl font-bold">{promo.title}</h3>
                <p className="text-sm mt-2 max-w-[70%]">{promo.subtitle}</p>
              </div>
              <Link 
                to={promo.link}
                className="bg-white text-black px-4 py-2 rounded-full inline-block w-max text-sm font-medium"
              >
                {promo.buttonText}
              </Link>
            </div>
            <img
              src={promo.image}
              alt={promo.title}
              className="absolute right-0 bottom-0 h-[85%] w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodPromotions; 