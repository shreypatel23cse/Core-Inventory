import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Product, UserProfile } from '../types';
import { Plus, Search, Filter, MoreVertical, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Products() {
  const { profile } = useOutletContext<{ profile: UserProfile | null }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canManageProducts = profile?.role === 'admin' || profile?.role === 'manager';
  
  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'General',
    uom: 'Units',
    description: '',
    active: true
  });

  const [isAdding, setIsAdding] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    setIsAdding(true);
    setSuccessMessage(null);
    try {
      await productsApi.create(newProduct);
      setIsModalOpen(false);
      setSuccessMessage('Product created successfully!');
      setNewProduct({
        name: '',
        sku: '',
        category: 'General',
        uom: 'Units',
        description: '',
        active: true
      });
      // Refresh product list
      fetchProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.message || 'Failed to create product');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium flex items-center space-x-2"
          >
            <Package size={18} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all font-medium">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          {canManageProducts && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all font-medium shadow-sm"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="col-header">Product</th>
                <th className="col-header">SKU</th>
                <th className="col-header">Category</th>
                <th className="col-header">UoM</th>
                <th className="col-header">Status</th>
                <th className="col-header w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="data-row">
                  <td className="data-value">
                    <div className="font-medium text-stone-900">{product.name}</div>
                    <div className="text-xs text-stone-400 font-sans mt-0.5 truncate max-w-[200px]">{product.description}</div>
                  </td>
                  <td className="data-value font-mono text-stone-600">{product.sku}</td>
                  <td className="data-value">
                    <span className="px-2 py-1 bg-stone-100 rounded text-[11px] font-medium text-stone-600 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="data-value text-stone-500">{product.uom}</td>
                  <td className="data-value">
                    <div className="flex items-center">
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${product.active ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                      <span className="text-xs font-medium">{product.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="data-value text-right">
                    <button className="p-1 hover:bg-stone-200 rounded text-stone-400">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="text-stone-200 mb-4" size={48} />
                      <p className="text-stone-400 font-serif italic">No products found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="text-lg font-bold text-stone-900">New Product</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      placeholder="e.g. Steel Rods"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">SKU / Code</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      placeholder="SKU-001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                    >
                      <option>General</option>
                      <option>Raw Material</option>
                      <option>Finished Goods</option>
                      <option>Consumables</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Unit of Measure</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.uom}
                      onChange={(e) => setNewProduct({...newProduct, uom: e.target.value})}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                      placeholder="kg, units, m"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-stone-400 mb-2">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 h-24 resize-none"
                    placeholder="Optional product details..."
                  />
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
                    disabled={isAdding}
                    className="px-8 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? 'Creating...' : 'Create Product'}
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
