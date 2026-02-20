import { motion } from 'framer-motion';
import { HiOutlineRefresh, HiOutlineClock, HiOutlineCheck, HiOutlineTruck, HiOutlineX } from 'react-icons/hi';
import { orderAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import './Orders.css';

const statusConfig = {
  pending: { icon: HiOutlineClock, color: '#f39c12', label: 'Pending' },
  preparing: { icon: HiOutlineClock, color: '#e8652e', label: 'Preparing' },
  ready: { icon: HiOutlineTruck, color: '#2ecc71', label: 'Ready for Pickup' },
  completed: { icon: HiOutlineCheck, color: '#27ae60', label: 'Completed' },
};

export default function Orders() {
  const { data, loading, error, refetch } = useFetch(() => orderAPI.getUserOrders(), []);
  const orders = Array.isArray(data) ? data : [];

  return (
    <div className="orders-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="orders-header">
            <div>
              <h1>Your Orders</h1>
              <p>Track your current and past orders</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={refetch}>
              <HiOutlineRefresh /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="orders-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton order-skeleton" style={{ height: 120 }} />
              ))}
            </div>
          ) : error ? (
            <div className="orders-empty">
              <p>Failed to load orders: {error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <span>📋</span>
              <p>No orders yet</p>
              <small>Your orders will appear here once you place them</small>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, i) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={order.id}
                    className="order-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="order-card__header">
                      <div>
                        <span className="order-card__id">#{order.id?.slice(-8).toUpperCase()}</span>
                        <span className="order-card__date">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="order-card__status" style={{ '--status-color': status.color }}>
                        <StatusIcon />
                        {status.label}
                      </div>
                    </div>

                    <div className="order-card__items">
                      {(order.order_items || []).map((item, idx) => (
                        <span key={idx} className="order-card__item">
                          ×{item.quantity} — ₹{item.price}
                        </span>
                      ))}
                    </div>

                    <div className="order-card__footer">
                      <span className="order-card__total">₹{Number(order.total_price).toFixed(2)}</span>
                      {order.status !== 'completed' && (
                        <div className="order-progress">
                          {['pending', 'preparing', 'ready'].map((s, idx) => (
                            <div
                              key={s}
                              className={`order-progress__step ${
                                ['pending', 'preparing', 'ready'].indexOf(order.status) >= idx
                                  ? 'order-progress__step--done'
                                  : ''
                              }`}
                            >
                              <div className="order-progress__dot" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
