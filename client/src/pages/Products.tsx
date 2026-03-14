import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';

export default function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: async () => (await productsApi.list()).data });
  
  const { register, handleSubmit, reset } = useForm();
  
  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
    }
  });

  const filteredProducts = products?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search SKU or Product Name..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate- overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Unit</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Min Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts?.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{p.description}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 font-bold">{p.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{p.unit}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-bold text-right">{p.minStockLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-8 text-center text-slate-400">Loading products...</div>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <h3 className="font-bold text-slate-900 mb-6">Add New Product</h3>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
              <input {...register('name', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label>
              <input {...register('sku', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                <input {...register('unit', { required: true })} placeholder="kg, pcs, etc" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min. Stock</label>
                <input type="number" {...register('minStockLevel')} defaultValue={10} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
              <textarea {...register('description')} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 h-20" />
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {createMutation.isPending ? 'Processing...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
