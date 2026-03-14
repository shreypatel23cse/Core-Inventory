import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { Warehouse as WarehouseIcon, Plus, MapPin, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [selectedWh, setSelectedWh] = useState<any>(null);
  
  const { data: warehouses, isLoading } = useQuery({ 
    queryKey: ['warehouses'], 
    queryFn: async () => (await warehousesApi.list()).data 
  });
  
  const { register, handleSubmit, reset } = useForm();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => warehousesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      reset();
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Drill Down / List */}
          {selectedWh ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-300">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                    <WarehouseIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedWh.name}</h3>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{selectedWh.shortCode}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWh(null)}
                  className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all font-bold text-xs flex items-center gap-1"
                >
                  <X size={16} /> Close
                </button>
              </div>
              
              <div className="p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Locations in Registry</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedWh.locations?.map((loc: any) => (
                    <div key={loc.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:border-indigo-100 hover:bg-white flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white text-slate-400 rounded-lg group-hover:text-indigo-600 transition-colors shadow-sm">
                          <MapPin size={14} />
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{loc.name}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">{loc.shortCode}</span>
                    </div>
                  ))}
                  {(!selectedWh.locations || selectedWh.locations.length === 0) && (
                    <p className="text-slate-400 text-sm italic py-4">No locations found in this warehouse.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warehouses?.map((wh: any) => (
                <div 
                  key={wh.id} 
                  onClick={() => setSelectedWh(wh)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <WarehouseIcon size={20} />
                    </div>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded tracking-widest uppercase">
                      {wh.shortCode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{wh.name}</h3>
                  <p className="text-sm text-slate-400 mb-6 truncate">{wh.address || 'No address provided'}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg">
                      <MapPin size={14} />
                      {wh.locations?.length || 0} Locations
                    </div>
                    <div className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <div className="text-slate-400 p-8">Loading warehouses...</div>}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-6 font-serif italic text-lg opacity-70">New Warehouse</h3>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Warehouse Name</label>
              <input {...register('name', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Short Code</label>
              <input {...register('shortCode', { required: true })} placeholder="WH-01" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Address</label>
              <textarea {...register('address')} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-24" />
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {createMutation.isPending ? 'Saving...' : 'Create Warehouse'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
