import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiPlus, HiMinus, HiOutlineTrash } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-drawer__header">
              <h3>Your Cart <span className="cart-count">({totalItems})</span></h3>
              <button className="cart-close" onClick={closeCart}>
                <HiOutlineX />
              </button>
            </div>

            <div className="cart-drawer__body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty__icon">🛒</span>
                  <p>Your cart is empty</p>
                  <span className="cart-empty__sub">Browse our menu and add something delicious!</span>
                </div>
              ) : (
                <div className="cart-items">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="cart-item__image">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <span className="cart-item__emoji">🍔</span>
                        )}
                      </div>
                      <div className="cart-item__info">
                        <h4>{item.name}</h4>
                        <span className="cart-item__price">₹{item.price}</span>
                      </div>
                      <div className="cart-item__controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <HiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <HiPlus />
                        </button>
                      </div>
                      <button className="cart-item__remove" onClick={() => removeItem(item.id)}>
                        <HiOutlineTrash />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total__amount">₹{totalPrice.toFixed(2)}</span>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
