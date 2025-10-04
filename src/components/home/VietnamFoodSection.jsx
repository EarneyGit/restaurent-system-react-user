import { CheckCircle, Utensils, Coffee, Salad, Soup, Star } from "lucide-react";

export default function RasoieFoodSection() {
  return (
    <section className=" rounded-xl">
      {/* Restaurant Section - Top */}
      {/* <div className="max-w-7xl mx-auto px-6 md:px-12">
  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
    Why Dine With Rasoie?
  </h2>

  <div className="grid md:grid-cols-3 gap-6 md:gap-8">
    {[
      {
        title: "Authentic Indian Flavours",
        description:
          "Enjoy the rich and diverse taste of India with traditional recipes prepared with care.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
        ),
        height: "h-64",
      },
      {
        title: "Warm & Cozy Ambience",
        description:
          "Relax in our welcoming environment designed for family dinners and friendly gatherings.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
        height: "h-72",
      },
      {
        title: "Fresh Ingredients",
        description:
          "We select only the freshest, high-quality ingredients to craft flavorful meals every day.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 16a7 7 0 110-14 7 7 0 010 14z" />
          </svg>
        ),
        height: "h-80",
      },
      {
        title: "Signature Dishes",
        description:
          "Savor our signature recipes that highlight the best of Indian cuisine in every bite.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16v16H4z" />
          </svg>
        ),
        height: "h-64",
      },
      {
        title: "Healthy Options",
        description:
          "Explore our balanced menu including light, nutritious choices for every palate.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
        height: "h-72",
      },
      {
        title: "Exquisite Service",
        description:
          "Our attentive staff ensures every dining experience is memorable and delightful.",
        icon: (
          <svg
            className="w-10 h-10 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
          </svg>
        ),
        height: "h-80",
      },
    ].map((card, idx) => (
      <div
        key={idx}
        className={`relative ${card.height} bg-gray-100 rounded-3xl p-6 shadow-lg flex items-start gap-4 transition hover:scale-105`}
      >
        <div className="flex-shrink-0 -mt-4">
          <div className="bg-white p-3 rounded-full shadow-lg">{card.icon}</div>
        </div>

        {/* Text content 
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            {card.title}
          </h3>
          <p className="text-gray-700 text-sm md:text-base">{card.description}</p>
        </div>
      </div>
    ))}
  </div>
</div> */}

      {/* Food Features Section - Bottom */}
      <div className="px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center mt-10">
        {/* Left Content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Key Features of Rasoie's Menu
          </h2>
          <p className="text-gray-700 max-w-xl mb-8">
            Rasoie offers authentic Indian cuisine with fresh ingredients, rich
            flavors, and carefully curated dishes to delight every taste.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Fresh Ingredients",
              "Traditional Recipes",
              "Spice Mastery",
              "Vegetarian & Vegan Options",
              "Signature Curries",
              "Tandoori Specialties",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-800">
                <CheckCircle className="text-yellow-500 w-5 h-5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Images */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="relative overflow-hidden rounded-3xl shadow-lg transition hover:scale-100">
            <img
              src="/food_img_2.jpg"
              alt="Rasoie Dish 1"
              className="object-cover w-full h-64"
            />
          </div>
          <div className="relative overflow-hidden rounded-3xl shadow-lg transition hover:scale-100">
            <img
              src="/food_img_1.jpg"
              alt="Rasoie Dish 2"
              className="object-cover w-full h-64"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
