import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle,
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await dashboardApi.getStats();
      return data;
    }
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-[var(--muted-foreground)] animate-pulse font-medium">
      Syncing enterprise data...
    </div>
  );

  const kpis = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'primary' },
    { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: AlertTriangle, color: 'rose' },
    { label: 'Pending Receipts', value: stats?.pendingReceipts || 0, icon: ArrowDownLeft, color: 'emerald' },
    { label: 'Pending Deliveries', value: stats?.pendingDeliveries || 0, icon: ArrowUpRight, color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={kpi.label} 
            className="card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                kpi.color === 'primary' ? "bg-primary/10 text-primary" :
                kpi.color === 'rose' ? "bg-red-500/10 text-red-500" :
                kpi.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500" :
                "bg-amber-500/10 text-amber-500"
              )}>
                <kpi.icon size={24} />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp size={16} className="text-[var(--muted-foreground)]" />
              </div>
            </div>
            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{kpi.label}</p>
            <h3 className="text-3xl font-black text-[var(--foreground)] mt-2">{kpi.value}</h3>
            <div className="absolute bottom-0 left-0 w-full h-1 opacity-20 bg-gradient-to-r from-transparent via-current to-transparent"></div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 card p-8">
          <h3 className="font-black text-[var(--foreground)] mb-6 flex items-center gap-2 text-lg uppercase tracking-tight">
            <Activity size={20} className="text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/receipts" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-[var(--foreground)]">New Receipt</span>
            </Link>
            <Link to="/deliveries" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-[var(--foreground)]">New Delivery</span>
            </Link>
            <Link to="/products" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-[var(--foreground)]">Manage Products</span>
            </Link>
            <Link to="/transfers" className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <div className="p-2.5 bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-xl group-hover:scale-110 transition-transform"><Plus size={18} /></div>
              <span className="text-sm font-bold text-[var(--foreground)]">Stock Transfer</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[var(--foreground)] text-lg uppercase tracking-tight">Live Movements</h3>
            <Link to="/move-history" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View Ledger</Link>
          </div>
          <div className="space-y-4">
            {stats?.recentMoves?.map((move: any) => (
              <div key={move.id} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 rounded-xl px-4 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner",
                    move.quantity > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {move.quantity > 0 ? '+' : ''}{move.quantity}
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--foreground)] tracking-tight group-hover:text-primary transition-colors">{move.product.name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">{move.reference} • {new Date(move.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--muted-foreground)] font-mono font-bold uppercase tracking-widest bg-[var(--muted)] px-2 py-0.5 rounded-md">
                    {move.sourceLocation || 'EXT'} → {move.destinationLocation || 'EXT'}
                  </p>
                </div>
              </div>
            ))}
            {(!stats?.recentMoves || stats.recentMoves.length === 0) && (
               <div className="text-center py-12">
                  <Activity size={40} className="mx-auto text-[var(--muted)] mb-4" />
                  <p className="text-[var(--muted-foreground)] text-sm italic font-medium">No recent ledger entries found.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
