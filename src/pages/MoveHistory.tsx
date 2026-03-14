import { useState, useEffect } from 'react';
import { moveHistoryApi, productsApi } from '../services/api';
import { MoveHistory, Product } from '../types';
import { History, ArrowRight, Package, Calendar, Search } from 'lucide-react';
import { motion } from 'motion/react';

export default function MoveHistoryPage() {
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, productsData] = await Promise.all([
          moveHistoryApi.list(),
          productsApi.list(),
        ]);

        setHistory(historyData);

        const pMap: Record<string, Product> = {};
        productsData.forEach((p: Product) => {
          pMap[p.id] = p;
        });
        setProducts(pMap);
      } catch (err) {
        console.error('Failed to fetch move history:', err);
      }
    };
    fetchData();
  }, []);

  const filteredHistory = history.filter(h => {
    const product = products[h.productId];
    if (!product) return false;
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl shadow-lg">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Move History</h2>
            <p className="text-stone-500 text-sm font-serif italic">Traceable ledger of all stock movements.</p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input 
            type="text" 
            placeholder="Filter by product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="col-header">Timestamp</th>
                <th className="col-header">Product</th>
                <th className="col-header">Movement</th>
                <th className="col-header">Quantity</th>
                <th className="col-header">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((move, i) => (
                <motion.tr 
                  key={move.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="data-row"
                >
                  <td className="data-value text-stone-400">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-2" />
                      {formatDate(move.timestamp)}
                    </div>
                  </td>
                  <td className="data-value">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 mr-3">
                        <Package size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-stone-900">{products[move.productId]?.name || 'Unknown Product'}</div>
                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">{products[move.productId]?.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="data-value">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs px-2 py-0.5 bg-stone-100 rounded border border-stone-200 text-stone-600">
                        {move.fromLocationId ? 'Warehouse' : 'External'}
                      </span>
                      <ArrowRight size={14} className="text-stone-300" />
                      <span className="text-xs px-2 py-0.5 bg-stone-900 text-white rounded border border-stone-900">
                        {move.toLocationId ? 'Warehouse' : 'External'}
                      </span>
                    </div>
                  </td>
                  <td className="data-value">
                    <span className="font-mono font-bold text-stone-900">
                      {move.quantity}
                    </span>
                    <span className="ml-1 text-[10px] text-stone-400 uppercase">{products[move.productId]?.uom}</span>
                  </td>
                  <td className="data-value">
                    <span className="text-xs font-mono text-stone-500 hover:text-stone-900 cursor-pointer underline decoration-stone-200 underline-offset-4">
                      {move.operationId.slice(-8)}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-stone-400 font-serif italic">
                    No movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
