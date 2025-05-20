import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes.tsx';

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <AppRoutes />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
