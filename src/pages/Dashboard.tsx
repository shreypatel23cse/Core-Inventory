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
      color: 'bg-primary/10 text-primary' 
    },
    { 
      label: 'Low Stock Items', 
      value: stock.filter(s => s.quantity < 10).length, 
      icon: AlertTriangle, 
      color: 'bg-amber-500/10 text-amber-500' 
    },
    { 
      label: 'Pending Receipts', 
      value: operations.filter(o => o.type === 'receipt' && o.status !== 'done').length, 
      icon: ArrowDownLeft, 
      color: 'bg-emerald-500/10 text-emerald-500' 
    },
    { 
      label: 'Pending Deliveries', 
      value: operations.filter(o => o.type === 'delivery' && o.status !== 'done').length, 
      icon: ArrowUpRight, 
      color: 'bg-rose-500/10 text-rose-500' 
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
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-[var(--muted-foreground)] opacity-30" />
            </div>
            <p className="text-[var(--muted-foreground)] text-xs font-mono uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-[var(--foreground)] mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Operations */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--foreground)]">Recent Operations</h2>
            <button className="text-xs font-mono text-[var(--muted-foreground)] hover:text-primary uppercase tracking-widest transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--muted)]/50">
                  <th className="col-header">Reference</th>
                  <th className="col-header">Type</th>
                  <th className="col-header">Status</th>
                  <th className="col-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {operations.slice(0, 5).map((op) => (
                  <tr key={op.id} className="data-row">
                    <td className="data-value font-medium text-[var(--foreground)]">{op.reference}</td>
                    <td className="data-value text-[var(--muted-foreground)]">
                      <span className="capitalize">{op.type}</span>
                    </td>
                    <td className="data-value">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        op.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                        op.status === 'draft' ? 'bg-[var(--muted)] text-[var(--muted-foreground)]' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="data-value text-[var(--muted-foreground)]/60">
                      {formatDate(op.createdAt)}
                    </td>
                  </tr>
                ))}
                {operations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[var(--muted-foreground)] font-serif italic">
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
          <div className="bg-primary text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="relative z-10 transition-transform group-hover:translate-x-1">
              <h3 className="text-xl font-bold mb-2">Inventory Health</h3>
              <p className="text-white/80 text-sm mb-6">Your stock levels are looking good today.</p>
              <div className="flex items-center space-x-2 text-white/90">
                <TrendingUp size={16} />
                <span className="text-xs font-mono uppercase tracking-widest">System Optimal</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
              <Package size={160} />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center">
              <Clock size={18} className="mr-2 text-[var(--muted-foreground)]" />
              Upcoming Tasks
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Weekly Stock Count</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Scheduled for tomorrow, 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Vendor Shipment #202</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Expected in 2 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
