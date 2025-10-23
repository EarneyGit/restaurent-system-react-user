import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function BannerSection() {
  const navigate = useNavigate();
  return (
    <section className="w-full bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* --- Left Section --- */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 text-center lg:text-left space-y-6"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
            Delicious Meals Delivered <br />
            <span className="text-yellow-600">Right to Your Doorstep!</span>
          </h1>

          <p className=" text-base text-gray-700 max-w-xl mx-auto lg:mx-0">
            Browse a wide selection of restaurants and dishes near you. Enjoy
            hot, fresh meals delivered quickly and reliably, whenever you're
            hungry.
          </p>

          {/* <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/app/products/All")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-8 rounded-full font-semibold shadow-md transition"
            >
              Explore Menu
            </button>
          </div> */}
        </motion.div>

        {/* --- Right Section (Image) --- */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 flex justify-center items-center"
        >
          <img
            src="/banner_img.png"
            alt="Delicious Food"
            className="w-96 h-96 max-w-md  object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
