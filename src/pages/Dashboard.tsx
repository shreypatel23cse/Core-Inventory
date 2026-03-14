import { useState, useEffect } from 'react';
import { productsApi, operationsApi, stockApi } from '../services/api';
import { Product, Operation, Stock } from '../types';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, ops, stk] = await Promise.all([
          productsApi.list(),
          operationsApi.list(),
          stockApi.list(),
        ]);
        setProducts(prods);
        setOperations(ops);
        setStock(stk);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: Package, 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: 'Low Stock Items', 
      value: stock.filter(s => s.quantity < 10).length, 
      icon: AlertTriangle, 
      color: 'bg-amber-50 text-amber-600' 
    },
    { 
      label: 'Pending Receipts', 
      value: operations.filter(o => o.type === 'receipt' && o.status !== 'done').length, 
      icon: ArrowDownLeft, 
      color: 'bg-emerald-50 text-emerald-600' 
    },
    { 
      label: 'Pending Deliveries', 
      value: operations.filter(o => o.type === 'delivery' && o.status !== 'done').length, 
      icon: ArrowUpRight, 
      color: 'bg-rose-50 text-rose-600' 
    },
  ];

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-stone-300" />
            </div>
            <p className="text-stone-500 text-xs font-mono uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-stone-900 mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Operations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-900">Recent Operations</h2>
            <button className="text-xs font-mono text-stone-400 hover:text-stone-600 uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50">
                  <th className="col-header">Reference</th>
                  <th className="col-header">Type</th>
                  <th className="col-header">Status</th>
                  <th className="col-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {operations.slice(0, 5).map((op) => (
                  <tr key={op.id} className="data-row">
                    <td className="data-value font-medium">{op.reference}</td>
                    <td className="data-value">
                      <span className="capitalize">{op.type}</span>
                    </td>
                    <td className="data-value">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        op.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                        op.status === 'draft' ? 'bg-stone-100 text-stone-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="data-value text-stone-400">
                      {formatDate(op.createdAt)}
                    </td>
                  </tr>
                ))}
                {operations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-stone-400 font-serif italic">
                      No operations recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="space-y-6">
          <div className="bg-stone-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Inventory Health</h3>
              <p className="text-stone-400 text-sm mb-6">Your stock levels are looking good today.</p>
              <div className="flex items-center space-x-2 text-emerald-400">
                <TrendingUp size={16} />
                <span className="text-xs font-mono uppercase tracking-widest">System Optimal</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Package size={160} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center">
              <Clock size={18} className="mr-2 text-stone-400" />
              Upcoming Tasks
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-stone-900">Weekly Stock Count</p>
                  <p className="text-xs text-stone-500">Scheduled for tomorrow, 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-stone-900">Vendor Shipment #202</p>
                  <p className="text-xs text-stone-500">Expected in 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
