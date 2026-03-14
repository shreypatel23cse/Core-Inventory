import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi, warehousesApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Warehouse } from 'lucide-react';

export default function Locations() {
  const queryClient = useQueryClient();
  const { data: locations, isLoading } = useQuery({ queryKey: ['locations'], queryFn: async () => (await locationsApi.list()).data });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: async () => (await warehousesApi.list()).data });
  
  const { register, handleSubmit, reset } = useForm();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      reset();
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {locations?.map((loc: any) => (
                <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><MapPin size={14} /></div>
                      <span className="font-bold text-slate-800 text-sm">{loc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 font-bold">{loc.shortCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Warehouse size={12} />
                      {loc.warehouse?.name}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-slate-400">Loading locations...</div>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-6 font-serif italic text-lg opacity-70">New Location</h3>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Warehouse</label>
              <select {...register('warehouseId', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Select Warehouse</option>
                {warehouses?.map((wh: any) => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.shortCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Location Name</label>
              <input {...register('name', { required: true })} placeholder="Storage A, Receiving, etc" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Short Code</label>
              <input {...register('shortCode', { required: true })} placeholder="A-01" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {createMutation.isPending ? 'Processing...' : 'Create Location'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
