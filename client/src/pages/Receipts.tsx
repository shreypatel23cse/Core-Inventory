import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi, productsApi, locationsApi } from '../services/api';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowDownLeft, Plus, XCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Receipts() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  
  const { data: receipts, isLoading } = useQuery({ 
    queryKey: ['receipts'], 
    queryFn: async () => (await receiptsApi.list()).data 
  });
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: async () => (await productsApi.list()).data });
  const { data: locations } = useQuery({ queryKey: ['locations'], queryFn: async () => (await locationsApi.list()).data });
  
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { vendor: '', destinationLocationId: '', items: [{ productId: '', quantity: 1 }] }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  
  const createMutation = useMutation({
    mutationFn: (data: any) => receiptsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setShowAdd(false);
      reset();
      navigate(`/receipts/${data.data.id}`);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
             <ArrowDownLeft size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Incoming Receipts</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Inventory Operations / In</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg"
        >
          {showAdd ? 'Close Panel' : <><Plus size={18} /> New Receipt</>}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Create New Draft Receipt</h3>
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Receive From (Vendor)</label>
                <input {...register('vendor', { required: true })} placeholder="e.g. Acme Logistics" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Destination Location</label>
                <select {...register('destinationLocationId', { required: true })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700">
                  <option value="">Select Location</option>
                  {locations?.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>{loc.warehouse.shortCode} / {loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Items</label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end animate-in fade-in duration-200">
                    <div className="flex-1">
                      <select {...register(`items.${index}.productId` as const, { required: true })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
                        <option value="">Select Product</option>
                        {products?.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input type="number" {...register(`items.${index}.quantity` as const, { required: true, min: 1 })} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-center font-bold" />
                    </div>
                    <button type="button" onClick={() => remove(index)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors"><XCircle size={20} /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => append({ productId: '', quantity: 1 })} className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors w-fit">
                <Plus size={14} /> Add Product Line
              </button>
            </div>

            <button disabled={createMutation.isPending} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg active:scale-[0.99] disabled:opacity-50">
              {createMutation.isPending ? 'Saving Instance...' : 'Create Draft Receipt'}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Ref</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {receipts?.map((r: any) => (
                <tr 
                  key={r.id} 
                  onClick={() => navigate(`/receipts/${r.id}`)}
                  className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        r.status === 'Done' ? 'bg-emerald-500' : 
                        r.status === 'Ready' ? 'bg-indigo-500' :
                        r.status === 'Cancelled' ? 'bg-rose-500' : 'bg-slate-300'
                      }`} />
                      <span className="font-black text-slate-900 text-sm tracking-tight">{r.reference}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-700">{r.vendor}</td>
                  <td className="px-8 py-6">
                    <div className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
                      {r.destinationLocation.warehouse.shortCode} / {r.destinationLocation.name}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      r.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      r.status === 'Ready' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      r.status === 'Draft' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                      'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                       <ChevronRight size={18} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && <div className="p-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Loading Records...</div>}
        </div>
      </div>
    </div>
  );
}
