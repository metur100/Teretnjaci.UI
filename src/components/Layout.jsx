import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide footer during initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <main style={{ 
        flex: 1, 
        minHeight: 'calc(100vh - 180px)', // Adjust based on header + footer height
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </main>
      {!isLoading && <Footer />}
    </>
  );
};

export default Layout;