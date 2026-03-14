import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { Plus, Search, Trash2, Edit, Package, Hash } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
          <input 
            type="text" 
            placeholder="Search SKU or Product Name..." 
            className="w-full pl-10 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl text-[var(--foreground)] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                  <th className="px-6 py-4 text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-4 text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">Unit</th>
                  <th className="px-6 py-4 text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">Min Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProducts?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[var(--muted)]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="font-black text-[var(--foreground)] text-sm tracking-tight">{p.name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-wide truncate max-w-[200px]">{p.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-primary font-bold bg-primary/5 px-2 py-1 rounded-md">
                        {p.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] font-medium">{p.unit}</td>
                    <td className="px-6 py-4 text-sm text-[var(--foreground)] font-black text-right">{p.minStockLevel}</td>
                  </tr>
                ))}
                {filteredProducts?.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--muted-foreground)] italic text-sm">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isLoading && <div className="p-12 text-center text-[var(--muted-foreground)] font-bold animate-pulse text-xs uppercase tracking-widest">Loading master data...</div>}
        </div>

        <div className="card p-8 h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Plus size={80} className="text-primary" />
          </div>
          <h3 className="font-black text-[var(--foreground)] mb-8 text-lg uppercase tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
              <Plus size={18} />
            </div>
            Catalog Entry
          </h3>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Product Name</label>
              <input 
                {...register('name', { required: true })} 
                className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[var(--foreground)] font-medium transition-all" 
                placeholder="Enter product title"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">SKU identifier</label>
              <input 
                {...register('sku', { required: true })} 
                className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[var(--foreground)] font-medium transition-all" 
                placeholder="Unique SKU code"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Unit</label>
                <input 
                  {...register('unit', { required: true })} 
                  placeholder="kg, pcs, etc" 
                  className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[var(--foreground)] font-medium transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">Min. Level</label>
                <input 
                  type="number" 
                  {...register('minStockLevel')} 
                  defaultValue={10} 
                  className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[var(--foreground)] font-medium transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase mb-2 tracking-widest ml-1">General Description</label>
              <textarea 
                {...register('description')} 
                className="w-full px-4 py-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[var(--foreground)] font-medium transition-all h-24 resize-none" 
                placeholder="Product details..."
              />
            </div>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="btn-primary w-full py-4 mt-2 shadow-lg shadow-primary/20"
            >
              {createMutation.isPending ? 'Processing...' : 'Add to Catalog'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
