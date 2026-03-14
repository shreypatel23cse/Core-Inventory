import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockApi, productsApi, locationsApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { Box, Search, PlusCircle, MinusCircle } from 'lucide-react';
import { useState } from 'react';

export default function Stock() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: stock, isLoading } = useQuery({ queryKey: ['stock'], queryFn: async () => (await stockApi.list()).data });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: async () => (await productsApi.list()).data });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await locationsApi.list()).data });
  
  const { register, handleSubmit, reset } = useForm();
  
  const adjustMutation = useMutation({
    mutationFn: (data: any) => stockApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      reset();
    }
  });

  const filteredStock = stock?.filter((s: any) => 
    s.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search stock by product or location..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">On Hand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Reserved</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStock?.map((s: any) => (
                <tr key={`${s.productId}-${s.locationId}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{s.product.name}</p>
                    <p className="font-mono text-[10px] text-slate-400 font-bold">{s.product.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-600">{s.location.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{s.location.warehouse?.shortCode}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">{s.onHand}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium text-right">{s.reserved}</td>
                  <td className="px-6 py-4 font-bold text-right">
                    <span className={`px-2 py-1 rounded text-xs ${s.onHand - s.reserved > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {s.onHand - s.reserved} {s.product.unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-slate-400">Loading stock data...</div>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-6 font-serif italic text-lg opacity-70">Manual Adjustment</h3>
          <form onSubmit={handleSubmit((data) => adjustMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Product</label>
              <select {...register('productId', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Select Product</option>
                {products?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Location</label>
              <select {...register('locationId', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="">Select Location</option>
                {locations?.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.shortCode})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Quantity</label>
                <input type="number" {...register('quantity', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Type</label>
                <select {...register('type', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="add">Add (+)</option>
                  <option value="subtract">Subtract (-)</option>
                </select>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={adjustMutation.isPending}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              {adjustMutation.isPending ? 'Processing...' : 'Save Adjustment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
