import { motion } from 'framer-motion';
import { HiPlus, HiOutlineFire } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import './FoodCard.css';

export default function FoodCard({ food, index = 0 }) {
  const { addItem } = useCart();

  return (
    <motion.div
      className={`food-card ${food.is_available === false ? 'food-card--unavailable' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="food-card__image">
        {food.image_url ? (
          <img src={food.image_url} alt={food.name} />
        ) : (
          <div className="food-card__placeholder">
            <span>🍽</span>
          </div>
        )}
        {food.is_available === false && (
          <div className="food-card__sold-out">Sold Out</div>
        )}
      </div>

      <div className="food-card__body">
        <div className="food-card__category">{food.category || 'Main Course'}</div>
        <h3 className="food-card__name">{food.name}</h3>
        <div className="food-card__footer">
          <span className="food-card__price">₹{food.price}</span>
          {food.is_available !== false && (
            <button className="food-card__add" onClick={() => addItem(food)}>
              <HiPlus /> Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
