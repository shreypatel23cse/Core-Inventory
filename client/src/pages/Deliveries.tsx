import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveriesApi, productsApi, locationsApi } from '../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowUpRight, Plus, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Deliveries() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  
  const { data: deliveries, isLoading } = useQuery({ queryKey: ['deliveries'], queryFn: async () => (await deliveriesApi.list()).data });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: async () => (await productsApi.list()).data });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await locationsApi.list()).data });
  
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { customer: '', sourceLocationId: '', items: [{ productId: '', quantity: 1 }] }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  
  const createMutation = useMutation({
    mutationFn: (data: any) => deliveriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      setShowAdd(false);
      reset();
    }
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => deliveriesApi.validate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'], queryKey2: ['stock'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Validation failed')
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Outgoing Deliveries</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
          {showAdd ? 'Close' : <><Plus size={18} /> New Delivery</>}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Customer Name</label>
                <input {...register('customer', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 tracking-wider">Source Location</label>
                <select {...register('sourceLocationId', { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                  <option value="">Select Location</option>
                  {locations?.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.shortCode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Items to Pick</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <select {...register(`items.${index}.productId` as const, { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value="">Select Product</option>
                      {products?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input type="number" {...register(`items.${index}.quantity` as const, { required: true })} className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              ))}
            </div>

            <button disabled={createMutation.isPending} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors">
              {createMutation.isPending ? 'Processing...' : 'Create Delivery Order'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {deliveries?.map((d: any) => (
              <tr key={d.id}>
                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{d.reference}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">{d.customer}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{d.sourceLocation.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    d.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 
                    d.status === 'Waiting' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {(d.status === 'Ready' || d.status === 'Draft') && (
                    <button onClick={() => validateMutation.mutate(d.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 ml-auto">
                      <CheckCircle size={14} /> Validate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
