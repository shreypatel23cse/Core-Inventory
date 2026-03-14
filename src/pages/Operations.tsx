import { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { operationsApi, productsApi } from '../services/api';
import { Operation, Product, UserProfile } from '../types';
import { Plus, CheckCircle, Clock, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Operations() {
  const { type } = useParams<{ type: string }>();
  const { profile } = useOutletContext<{ profile: UserProfile | null }>();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const canCreateOp = profile?.role === 'admin' || profile?.role === 'manager';
  const canValidateOp = profile?.role === 'admin' || profile?.role === 'manager' || profile?.role === 'staff';
  
  // New Operation Form
  const [newOp, setNewOp] = useState({
    reference: '',
    contact: '',
    scheduledDate: new Date().toISOString().split('T')[0],
  });
  const [selectedItems, setSelectedItems] = useState<{productId: string, quantity: number}[]>([]);

  const fetchData = async () => {
    try {
      const [ops, prods] = await Promise.all([
        operationsApi.list(type || null),
        productsApi.list(),
      ]);
      setOperations(ops);
      setProducts(prods);
    } catch (err) {
      console.error('Failed to fetch operations:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleCreateOp = async (e: any) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    try {
      await operationsApi.create({
        reference: newOp.reference || `${type?.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        type: type!,
        contact: newOp.contact,
        scheduledDate: newOp.scheduledDate,
        items: selectedItems,
      });

      setIsModalOpen(false);
      setNewOp({ reference: '', contact: '', scheduledDate: new Date().toISOString().split('T')[0] });
      setSelectedItems([]);
      fetchData();
    } catch (err: any) {
      console.error('Create operation error:', err);
      alert(err.message || 'Failed to create operation');
    }
  };

  const handleValidate = async (opId: string) => {
    if (confirm('Are you sure you want to validate this operation? This will update stock levels.')) {
      try {
        await operationsApi.validate(opId);
        fetchData();
      } catch (err: any) {
        console.error('Validate error:', err);
        alert(err.message || 'Failed to validate operation');
      }
    }
  };

  const addItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900 capitalize">{type}s</h2>
            <p className="text-stone-500 text-sm font-serif italic">Manage your incoming and outgoing stock.</p>
          </div>
        </div>
        {canCreateOp && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all font-medium shadow-lg"
          >
            <Plus size={18} />
            <span>New {type}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="col-header">Reference</th>
                <th className="col-header">Contact</th>
                <th className="col-header">Scheduled Date</th>
                <th className="col-header">Status</th>
                <th className="col-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr key={op.id} className="data-row">
                  <td className="data-value font-mono font-bold text-stone-900">{op.reference}</td>
                  <td className="data-value text-stone-600">{op.contact || 'N/A'}</td>
                  <td className="data-value text-stone-400">{op.scheduledDate ? new Date(op.scheduledDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="data-value">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      op.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                      op.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {op.status === 'done' ? <CheckCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                      {op.status}
                    </div>
                  </td>
                  <td className="data-value text-right">
                    {op.status !== 'done' && canValidateOp && (
                      <button 
                        onClick={() => handleValidate(op.id)}
                        className="text-xs font-bold text-stone-900 hover:text-emerald-600 uppercase tracking-widest px-3 py-1 border border-stone-200 rounded-lg hover:border-emerald-200 transition-all"
                      >
                        Validate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {operations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-stone-400 font-serif italic">
                    No {type}s found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Operation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="text-lg font-bold text-stone-900 uppercase tracking-tight">New {type}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateOp} className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Reference (Optional)</label>
                    <input 
                      type="text" 
                      value={newOp.reference}
                      onChange={(e) => setNewOp({...newOp, reference: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Contact / Vendor</label>
                    <input 
                      required
                      type="text" 
                      value={newOp.contact}
                      onChange={(e) => setNewOp({...newOp, contact: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-stone-900">Products</h4>
                    <button 
                      type="button"
                      onClick={addItem}
                      className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center"
                    >
                      <Plus size={14} className="mr-1" /> Add Line
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <select 
                          required
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                        <input 
                          required
                          type="number" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-24 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 text-center font-mono"
                        />
                        <button 
                          type="button"
                          onClick={() => setSelectedItems(selectedItems.filter((_, i) => i !== index))}
                          className="p-2.5 text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Plus className="rotate-45" size={20} />
                        </button>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <div className="text-center p-8 border-2 border-dashed border-stone-100 rounded-2xl text-stone-400 text-sm italic">
                        No products added. Click "Add Line" to start.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-stone-500 font-medium hover:text-stone-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={selectedItems.length === 0}
                    className="px-8 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create {type}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
