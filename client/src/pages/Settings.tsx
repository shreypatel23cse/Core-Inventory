import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/api';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Hash, Save } from 'lucide-react';

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

  if (isLoading) return <div className="p-8 text-slate-400 font-bold uppercase text-xs tracking-widest">Loading Preferences...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-slate-900 text-white rounded-2xl">
              <SettingsIcon size={24} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">System Configuration</h3>
              <p className="text-sm text-slate-400 font-bold">Global inventory behavior and notification rules.</p>
           </div>
        </div>
        
        <div className="space-y-4">
          {/* Auto SKU */}
          <div 
            onClick={toggleAutoSku}
            className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
              localSettings.autoSku ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${localSettings.autoSku ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                 <Hash size={20} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-wide">Automated SKU Generation</p>
                <p className="text-xs text-slate-500 font-medium">Auto-generate unique part numbers for new inventory items.</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.autoSku ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${localSettings.autoSku ? 'left-6' : 'left-1'}`} />
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div 
            onClick={toggleAlerts}
            className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
              localSettings.lowStockAlerts ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl ${localSettings.lowStockAlerts ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                 <Bell size={20} />
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm uppercase tracking-wide">Low Stock Alerts</p>
                <p className="text-xs text-slate-500 font-medium">Trigger system-wide notifications when quantity drops below minimum.</p>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors relative ${localSettings.lowStockAlerts ? 'bg-emerald-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${localSettings.lowStockAlerts ? 'left-6' : 'left-1'}`} />
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button 
            onClick={() => updateMutation.mutate(localSettings)}
            disabled={updateMutation.isPending}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {updateMutation.isPending ? 'Syncing...' : 'Apply Changes'}
          </button>
          
          {success && (
            <p className="text-emerald-600 font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
              Configuration Saved Successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
