import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await dashboardApi.getStats();
      return data;
    }
  });

  if (isLoading) return <div className="text-slate-400">Loading stats...</div>;

  const kpis = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: AlertTriangle, bgColor: 'bg-rose-50', textColor: 'text-rose-600' },
    { label: 'Pending Receipts', value: stats?.pendingReceipts || 0, icon: ArrowDownLeft, bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Pending Deliveries', value: stats?.pendingDeliveries || 0, icon: ArrowUpRight, bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bgColor} ${kpi.textColor}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between text-lg">
            Quick Hub
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/receipts" className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-100 transition-colors group">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-slate-700">Receipts</span>
            </Link>
            <Link to="/deliveries" className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-100 transition-colors group">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-slate-700">Deliveries</span>
            </Link>
            <Link to="/products" className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-100 transition-colors group">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-slate-700">Products</span>
            </Link>
            <Link to="/transfers" className="flex items-center gap-3 p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-100 transition-colors group">
              <div className="p-2 bg-slate-900 text-white rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-slate-700">Transfers</span>
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">Live Movements</h3>
          <div className="space-y-4">
            {stats?.recentMoves?.map((move: any) => (
              <div key={move.id} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-800 lowercase tracking-tight">{move.product.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{move.reference} • {new Date(move.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{move.quantity}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{move.sourceLocation || 'External'} → {move.destinationLocation || 'External'}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentMoves || stats.recentMoves.length === 0) && (
               <p className="text-slate-400 text-sm italic font-medium p-4 text-center">No recent ledger entries.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
