import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes";
import { CartProvider } from "@/context/CartContext";
import "@/App.css";
import { Toaster } from "sonner";

const App = () => {
  return (
    <>
      <Toaster position="bottom-right" expand={true} />
      <BrowserRouter>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
