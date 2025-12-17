import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
      <Footer style={{ marginTop: 'auto' }} />
    </div>
  );
};

export default Layout;