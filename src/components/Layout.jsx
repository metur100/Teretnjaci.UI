import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <>
      <Header />
      <main style={{ 
        flex: '1 0 auto',
        width: '100%',
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;