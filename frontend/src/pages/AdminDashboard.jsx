import { motion } from 'framer-motion';
import { HiOutlineCollection, HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineClock } from 'react-icons/hi';
import { orderAPI, foodAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { data: foodData, loading: foodLoading } = useFetch(() => foodAPI.getAll(), []);
  const { data: orderData, loading: orderLoading } = useFetch(() => orderAPI.getAdminOrders(), []);

  const foods = Array.isArray(foodData) ? foodData : [];
  const orders = Array.isArray(orderData) ? orderData : [];

  const stats = [
    {
      icon: HiOutlineCollection,
      label: 'Total Items',
      value: foods.length,
      color: '#3498db',
    },
    {
      icon: HiOutlineClipboardList,
      label: 'Total Orders',
      value: orders.length,
      color: '#e8652e',
    },
    {
      icon: HiOutlineClock,
      label: 'Pending',
      value: orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length,
      color: '#f39c12',
    },
    {
      icon: HiOutlineTrendingUp,
      label: 'Revenue',
      value: `₹${orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0).toFixed(0)}`,
      color: '#2ecc71',
    },
  ];

  const recentOrders = orders.slice(0, 5);
  const loading = foodLoading || orderLoading;

  return (
    <div className="admin-dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Overview of your canteen operations</p>
      </motion.div>

      {/* Stats */}
      <div className="admin-stats">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="stat-card__icon" style={{ '--stat-color': stat.color }}>
              <stat.icon />
            </div>
            <div>
              <div className="stat-card__value">
                {loading ? <span className="skeleton" style={{ width: 60, height: 28, display: 'inline-block' }} /> : stat.value}
              </div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        className="admin-recent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h3>Recent Orders</h3>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 50, borderRadius: 10 }} />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="admin-recent__empty">No orders yet</p>
        ) : (
          <div className="admin-recent__list">
            {recentOrders.map((order) => (
              <div key={order.id} className="admin-recent__row">
                <span className="admin-recent__id">#{order.id?.slice(-8).toUpperCase()}</span>
                <span className="admin-recent__items">
                  {(order.order_items || []).length} item(s)
                </span>
                <span className={`admin-recent__status admin-recent__status--${order.status}`}>
                  {order.status}
                </span>
                <span className="admin-recent__total">₹{Number(order.total_price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
