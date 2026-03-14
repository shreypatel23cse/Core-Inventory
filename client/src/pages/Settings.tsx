import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/api';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Hash, Save, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState({ autoSku: true, lowStockAlerts: false });

  const { data: settings, isLoading } = useQuery({ 
    queryKey: ['settings'], 
    queryFn: async () => (await settingsApi.get()).data,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        autoSku: settings.autoSku,
        lowStockAlerts: settings.lowStockAlerts
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const toggleAutoSku = () => setLocalSettings(prev => ({ ...prev, autoSku: !prev.autoSku }));
  const toggleAlerts = () => setLocalSettings(prev => ({ ...prev, lowStockAlerts: !prev.lowStockAlerts }));

  if (isLoading) return (
    <div className="p-8 text-[var(--muted-foreground)] font-bold uppercase text-xs tracking-widest animate-pulse">
      Initialising Preferences...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="card p-8 md:p-10 max-w-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20"></div>
        
        <div className="flex items-center gap-4 mb-10 relative">
           <div className="p-3.5 bg-primary/10 text-primary rounded-2xl shadow-inner">
              <SettingsIcon size={28} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight uppercase">System Configuration</h3>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">Manage global inventory behavior and security policies.</p>
           </div>
        </div>
        
        <div className="space-y-4">
          {/* Auto SKU */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={toggleAutoSku}
            className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
              localSettings.autoSku 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-[var(--muted)]/30 border-[var(--border)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-all ${localSettings.autoSku ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                 <Hash size={20} />
              </div>
              <div>
                <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-wide">Automated SKU Generation</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">Auto-generate unique part numbers for new inventory items.</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.autoSku ? 'bg-primary' : 'bg-[var(--border)]'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${localSettings.autoSku ? 'left-6' : 'left-1'}`} />
            </div>
          </motion.div>

          {/* Low Stock Alerts */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={toggleAlerts}
            className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
              localSettings.lowStockAlerts 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-[var(--muted)]/30 border-[var(--border)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-all ${localSettings.lowStockAlerts ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
                 <Bell size={20} />
              </div>
              <div>
                <p className="font-black text-[var(--foreground)] text-sm uppercase tracking-wide">Low Stock Alerts</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">Trigger system-wide notifications when quantity drops below minimum.</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.lowStockAlerts ? 'bg-emerald-500' : 'bg-[var(--border)]'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${localSettings.lowStockAlerts ? 'left-6' : 'left-1'}`} />
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-wrap items-center gap-6">
          <button 
            onClick={() => updateMutation.mutate(localSettings)}
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2 px-10 py-4 shadow-xl shadow-primary/10"
          >
            <Save size={18} />
            <span className="uppercase tracking-widest text-xs font-black">
              {updateMutation.isPending ? 'Syncing...' : 'Save Configuration'}
            </span>
          </button>
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]"
            >
              <CheckCircle size={16} />
              Configuration Synchronized
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
