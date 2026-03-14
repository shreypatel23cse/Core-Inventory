import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transfersApi, productsApi, locationsApi, stockApi } from '../services/api';
import { useForm } from 'react-hook-form';
import { RefreshCw, AlertCircle, CheckCircle2, Box, ArrowRight, Info } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Transfers() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { data: products } = useQuery({ 
    queryKey: ['products'], 
    queryFn: async () => (await productsApi.list()).data 
  });
  const { data: locations } = useQuery({ 
    queryKey: ['locations'], 
    queryFn: async () => (await locationsApi.list()).data 
  });
  const { data: stock } = useQuery({ 
    queryKey: ['stock'], 
    queryFn: async () => (await stockApi.list()).data 
  });
  
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      productId: '',
      sourceLocationId: '',
      destinationLocationId: '',
      quantity: 1
    }
  });

  const selectedProductId = watch('productId');
  const selectedSourceId = watch('sourceLocationId');
  const selectedDestId = watch('destinationLocationId');

  // Find available quantity at source
  const availableAtSource = useMemo(() => {
    if (!selectedProductId || !selectedSourceId || !stock) return 0;
    const item = stock.find((s: any) => s.productId === selectedProductId && s.locationId === selectedSourceId);
    return item ? item.onHand : 0;
  }, [selectedProductId, selectedSourceId, stock]);

  const transferMutation = useMutation({
    mutationFn: (data: any) => transfersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['moves'] });
      setSuccess('Internal transfer completed successfully!');
      setError('');
      reset();
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Transfer failed');
      setSuccess('');
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
             <RefreshCw size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Internal Stock Transfer</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Movement within warehouses</p>
          </div>
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-black border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-black border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={20} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit((data) => transferMutation.mutate(data))} className="space-y-10">
            {/* Product Selection */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product to Move</label>
              <div className="relative group">
                <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <select 
                  {...register('productId', { required: true })} 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-slate-900 appearance-none"
                >
                  <option value="">Select product...</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Source */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Source Location</label>
                <select 
                  {...register('sourceLocationId', { required: true })} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                >
                  <option value="">From...</option>
                  {locations?.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.warehouse.shortCode} / {l.name}</option>
                  ))}
                </select>
                
                {selectedProductId && selectedSourceId && (
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50 flex items-center gap-3">
                     <Info size={16} className="text-indigo-600" />
                     <p className="text-xs font-black text-indigo-700 uppercase tracking-widest">
                       Available: {availableAtSource}
                     </p>
                  </div>
                )}
              </div>

              {/* Destination */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Destination Target</label>
                <select 
                  {...register('destinationLocationId', { required: true })} 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-sm appearance-none"
                >
                  <option value="">To...</option>
                  {locations?.filter(l => l.id !== selectedSourceId).map((l: any) => (
                    <option key={l.id} value={l.id}>{l.warehouse.shortCode} / {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Transfer Quantity</label>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  {...register('quantity', { required: true, min: 1, max: availableAtSource })} 
                  className="max-w-[200px] px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-3xl font-black text-slate-900"
                  placeholder="0"
                />
                <div className="flex-1 text-slate-400 italic text-sm font-medium">
                  {selectedProductId && `Enter amount between 1 and ${availableAtSource}`}
                </div>
              </div>
            </div>

            {/* Action */}
            <button 
              type="submit" 
              disabled={transferMutation.isPending || !selectedProductId || !selectedSourceId || !selectedDestId || availableAtSource === 0}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {transferMutation.isPending ? 'Syncing Move...' : 'Complete Transfer'}
              {!transferMutation.isPending && <ArrowRight size={24} />}
            </button>
          </form>
        </div>
      </div>
      
      {/* Policy Note */}
      <p className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        Internal movements are recorded in the global ledger for audit compliance.
      </p>
    </div>
  );
}
