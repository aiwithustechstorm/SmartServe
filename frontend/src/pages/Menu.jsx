import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';
import { foodAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import FoodCard from '../components/FoodCard';
import './Menu.css';

export default function Menu() {
  const { data, loading, error } = useFetch(() => foodAPI.getAll(), []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const foods = data?.foods || data || [];

  const categories = useMemo(() => {
    const cats = [...new Set(foods.map((f) => f.category).filter(Boolean))];
    return ['all', ...cats];
  }, [foods]);

  const filtered = useMemo(() => {
    return foods.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || f.category === category;
      return matchSearch && matchCategory;
    });
  }, [foods, search, category]);

  return (
    <div className="menu-page">
      <div className="container">
        {/* Header */}
        <motion.div
          className="menu-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1>Our Menu</h1>
            <p>Fresh, delicious, ready when you are</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="menu-filters"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="menu-search">
            <HiOutlineSearch className="menu-search__icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="menu-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`menu-cat-btn ${category === cat ? 'menu-cat-btn--active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="menu-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton food-skeleton">
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="menu-empty">
            <p>Failed to load menu: {error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <span>🔍</span>
            <p>No dishes found</p>
            <small>Try a different search or category</small>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map((food, i) => (
              <FoodCard key={food.id} food={food} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
