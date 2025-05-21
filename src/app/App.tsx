import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import { CartProvider } from "@/context/CartContext";
import "@/App.css";

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </BrowserRouter>
  );
};

export default App; 