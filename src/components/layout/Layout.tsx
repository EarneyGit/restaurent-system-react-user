import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';

const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isReservationPage = location.pathname === '/reservation';

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && !isReservationPage && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isAuthPage && !isReservationPage && (
        <>
          {/* <BottomNavigation /> */}
          <Footer />
        </>
      )}
    </div>
  );
};

export default Layout; 