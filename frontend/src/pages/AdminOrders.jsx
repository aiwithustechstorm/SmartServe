import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineRefresh } from 'react-icons/hi';
import { orderAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import Toast from '../components/Toast';
import './AdminOrders.css';

const statusColors = {
  pending: '#f39c12',
  preparing: '#e8652e',
  ready: '#2ecc71',
  completed: '#27ae60',
};

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
};

const nextStatus = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
};

const nextButtonLabel = {
  pending: '🔥 Start Preparing',
  preparing: '✅ Mark Ready',
  ready: '🎉 Complete',
};

const statusFilterOptions = ['pending', 'preparing', 'ready', 'completed'];

export default function AdminOrders() {
  const { data, loading, refetch } = useFetch(() => orderAPI.getAdminOrders(), []);
  const orders = Array.isArray(data) ? data : [];
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const handleAdvanceStatus = async (id, currentStatus) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    try {
      await orderAPI.updateStatus(id, next);
      setToast({ message: `Order updated to ${next}`, type: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update order status', type: 'error' });
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="admin-orders">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="admin-orders__header">
          <div>
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-sub">Manage and update order statuses</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={refetch}>
            <HiOutlineRefresh /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="admin-orders__filters">
          {['all', ...statusFilterOptions].map((s) => (
            <button
              key={s}
              className={`menu-cat-btn ${filter === s ? 'menu-cat-btn--active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : statusLabels[s]}
              {s !== 'all' && (
                <span className="filter-count">
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-orders__empty">
            <span>📋</span>
            <p>No orders found</p>
          </div>
        ) : (
          <div className="admin-orders__list">
            {filtered.map((order, i) => (
              <motion.div
                key={order.id}
                className="admin-order-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="admin-order-card__top">
                  <div className="admin-order-card__meta">
                    <span className="admin-order-card__id">#{order.id?.slice(-8).toUpperCase()}</span>
                    <span className="admin-order-card__date">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {order.users && (
                      <span className="admin-order-card__user">
                        {order.users.name || order.users.email}
                      </span>
                    )}
                  </div>
                  <span className="admin-order-card__total">₹{Number(order.total_price).toFixed(2)}</span>
                </div>

                <div className="admin-order-card__items">
                  {(order.order_items || []).map((item, idx) => (
                    <span key={idx} className="order-card__item">
                      ×{item.quantity} — ₹{item.price}
                    </span>
                  ))}
                </div>

                {order.note && (
                  <div className="admin-order-card__note">
                    <strong>Note:</strong> {order.note}
                  </div>
                )}

                <div className="admin-order-card__actions">
                  <span
                    className="admin-order-card__status-badge"
                    style={{ background: statusColors[order.status], color: '#fff' }}
                  >
                    {statusLabels[order.status]}
                  </span>
                  {nextStatus[order.status] && (
                    <button
                      className="btn btn-primary btn-sm admin-order-advance-btn"
                      onClick={() => handleAdvanceStatus(order.id, order.status)}
                    >
                      {nextButtonLabel[order.status]}
                    </button>
                  )}
                  {!nextStatus[order.status] && (
                    <span className="admin-order-card__done">✓ Done</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
