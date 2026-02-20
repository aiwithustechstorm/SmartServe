import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineLocationMarker } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import Toast from '../components/Toast';
import './Checkout.css';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          food_id: i.id,
          quantity: i.quantity,
        })),
      };
      await orderAPI.create(orderData);
      clearCart();
      setToast({ message: 'Order placed successfully!', type: 'success' });
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to place order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-empty">
            <span>🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add items from the menu to get started</p>
            <button className="btn btn-primary" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-layout">
            {/* Order Summary */}
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="checkout-items">
                {items.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item__info">
                      <span className="checkout-item__name">{item.name}</span>
                      <span className="checkout-item__qty">×{item.quantity}</span>
                    </div>
                    <span className="checkout-item__price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-divider" />

              <div className="checkout-row checkout-row--total">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="checkout-details">
              <h3>Order Details</h3>
              <div className="checkout-field">
                <label>Special Instructions</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Any special requests? (e.g., no onions, extra spicy)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="checkout-pickup">
                <HiOutlineLocationMarker />
                <div>
                  <strong>Pickup at Canteen Counter</strong>
                  <small>You'll be notified when your order is ready</small>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : `Place Order — ₹${totalPrice.toFixed(2)}`} <HiOutlineArrowRight />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
