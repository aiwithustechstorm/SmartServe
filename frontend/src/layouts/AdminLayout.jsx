import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineViewGrid, HiOutlineCollection, HiOutlineClipboardList, HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const sideLinks = [
  { path: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid },
  { path: '/admin/foods', label: 'Food Items', icon: HiOutlineCollection },
  { path: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="noise-overlay" />

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__head">
          <img src="/logo.png" alt="SmartServe" className="admin-logo-img" />
          <div>
            <div className="admin-logo-text">Smart<span className="logo-accent">Serve</span></div>
            <div className="admin-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {sideLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`admin-nav__link ${location.pathname === link.path ? 'admin-nav__link--active' : ''}`}
            >
              <link.icon />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-info">
            <span className="user-avatar">{user?.name?.[0] || 'A'}</span>
            <div>
              <div className="admin-user-name">{user?.name || 'Admin'}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <HiOutlineLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="admin-content"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
