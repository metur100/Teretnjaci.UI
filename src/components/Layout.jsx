import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div style={{
      minHeight: 'calc(var(--vh, 2vh) * 100)', 
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;