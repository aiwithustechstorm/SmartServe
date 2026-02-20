import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { foodAPI } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import Toast from '../components/Toast';
import './AdminFoods.css';

const emptyForm = { name: '', price: '', category: '', image_url: '', is_available: true };

export default function AdminFoods() {
  const { data, loading, refetch } = useFetch(() => foodAPI.getAll(true), []);
  const foods = Array.isArray(data) ? data : [];

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (food) => {
    setEditId(food.id);
    setForm({
      name: food.name || '',
      price: food.price || '',
      category: food.category || '',
      image_url: food.image_url || '',
      is_available: food.is_available !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      // Convert empty image_url to null so backend validation doesn't reject ''
      if (!payload.image_url) payload.image_url = null;
      if (editId) {
        await foodAPI.update(editId, payload);
        setToast({ message: 'Food item updated!', type: 'success' });
      } else {
        await foodAPI.create(payload);
        setToast({ message: 'Food item added!', type: 'success' });
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this food item?')) return;
    try {
      await foodAPI.delete(id);
      setToast({ message: 'Food item deleted', type: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  const handleToggle = async (food) => {
    try {
      await foodAPI.update(food.id, { is_available: !food.is_available });
      refetch();
    } catch (err) {
      setToast({ message: 'Failed to update availability', type: 'error' });
    }
  };

  return (
    <div className="admin-foods">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="admin-foods__header">
          <div>
            <h1 className="admin-page-title">Food Items</h1>
            <p className="admin-page-sub">Manage your menu</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <HiOutlinePlus /> Add Item
          </button>
        </div>

        {loading ? (
          <div className="admin-table-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="admin-foods__empty">
            <span>🍽</span>
            <p>No food items yet</p>
            <button className="btn btn-primary" onClick={openAdd}>
              <HiOutlinePlus /> Add your first item
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id}>
                    <td>
                      <div className="food-cell">
                        <div className="food-cell__img">
                          {food.image_url ? <img src={food.image_url} alt="" /> : <span>🍽</span>}
                        </div>
                        <div>
                          <strong>{food.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td><span className="food-category-tag">{food.category || '—'}</span></td>
                    <td className="food-price">₹{food.price}</td>
                    <td>
                      <button
                        className={`toggle-switch ${food.is_available !== false ? 'toggle-switch--on' : ''}`}
                        onClick={() => handleToggle(food)}
                      >
                        <span className="toggle-switch__thumb" />
                      </button>
                    </td>
                    <td>
                      <div className="food-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(food)}>
                          <HiOutlinePencil />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(food.id)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="modal__header">
                <h3>{editId ? 'Edit Food Item' : 'Add Food Item'}</h3>
                <button onClick={() => setShowModal(false)}><HiOutlineX /></button>
              </div>
              <form className="modal__form" onSubmit={handleSave}>
                <div className="modal__field">
                  <label>Name</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="modal__row">
                  <div className="modal__field">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      className="input-field"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div className="modal__field">
                    <label>Category</label>
                    <input
                      className="input-field"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., Snacks, Drinks"
                    />
                  </div>
                </div>
                <div className="modal__field">
                  <label>Image URL</label>
                  <input
                    className="input-field"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="modal__field modal__field--inline">
                  <label>Available</label>
                  <button
                    type="button"
                    className={`toggle-switch ${form.is_available ? 'toggle-switch--on' : ''}`}
                    onClick={() => setForm({ ...form, is_available: !form.is_available })}
                  >
                    <span className="toggle-switch__thumb" />
                  </button>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
