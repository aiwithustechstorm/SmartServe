import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHome, HiOutlineClipboardList, HiOutlineShoppingBag, HiOutlineLogout, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import { useState } from 'react';
import './UserLayout.css';

const navLinks = [
  { path: '/', label: 'Home', icon: HiOutlineHome },
  { path: '/menu', label: 'Menu', icon: HiOutlineShoppingBag },
  { path: '/orders', label: 'Orders', icon: HiOutlineClipboardList },
];

export default function UserLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="user-layout">
      <div className="noise-overlay" />

      {/* Header */}
      <header className="user-header">
        <div className="user-header__inner container">
          <Link to="/" className="user-header__logo">
            <img src="/logo.png" alt="SmartServe" className="logo-img" />
          </Link>

          <nav className={`user-nav ${mobileNav ? 'user-nav--open' : ''}`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`user-nav__link ${location.pathname === link.path ? 'user-nav__link--active' : ''}`}
                onClick={() => setMobileNav(false)}
              >
                <link.icon />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="user-header__actions">
            {isAuthenticated && (
              <button className="cart-trigger" onClick={toggleCart}>
                <HiOutlineShoppingBag />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>
            )}

            {isAuthenticated ? (
              <div className="user-header__user">
                <span className="user-avatar">{user?.name?.[0] || 'U'}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <HiOutlineLogout /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            )}

            <button className="mobile-toggle" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <HiOutlineX /> : <HiOutlineMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="user-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="user-footer">
        <div className="container">
          <p>&copy; 2026 SmartServe — AI Maestros Tech Storm</p>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
