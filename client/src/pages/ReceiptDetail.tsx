import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { receiptsApi } from '../services/api';
import { ArrowLeft, Box, Printer, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { useState } from 'react';

export default function ReceiptDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: receipt, isLoading } = useQuery({ 
    queryKey: ['receipt', id], 
    queryFn: async () => (await receiptsApi.list()).data.find((r: any) => r.id === id) 
  });

  const markReadyMutation = useMutation({
    mutationFn: () => receiptsApi.markReady(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt', id] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Action failed')
  });

  const validateMutation = useMutation({
    mutationFn: () => receiptsApi.validate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt', id] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Validation failed')
  });

  const cancelMutation = useMutation({
    mutationFn: () => receiptsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipt', id] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Cancellation failed')
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-slate-400 font-medium">Loading receipt details...</div>;
  if (!receipt) return <div className="p-8 text-rose-500 font-bold">Receipt not found</div>;

  const steps = ['Draft', 'Ready', 'Done'];
  const currentStepIndex = steps.indexOf(receipt.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 print:p-0 print:space-y-4">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between no-print">
        <Link to="/receipts" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm">Back to Receipts</span>
        </Link>
        <div className="flex items-center gap-2">
           <button className="text-slate-400 hover:text-slate-600 font-bold text-xs">New</button>
           <span className="text-slate-300">/</span>
           <span className="text-slate-900 font-bold text-sm">Receipt</span>
        </div>
      </div>
      
      {/* Status & Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex flex-wrap gap-3">
          {receipt.status === 'Draft' && (
            <button 
              onClick={() => markReadyMutation.mutate()}
              disabled={markReadyMutation.isPending}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {markReadyMutation.isPending ? 'Processing...' : 'Mark as Ready'}
            </button>
          )}
          {receipt.status === 'Ready' && (
            <button 
              onClick={() => validateMutation.mutate()}
              disabled={validateMutation.isPending}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {validateMutation.isPending ? 'Validating...' : 'Validate'}
            </button>
          )}
          
          <button 
            onClick={handlePrint}
            className="border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Printer size={16} /> Print
          </button>
          
          {receipt.status !== 'Done' && receipt.status !== 'Cancelled' && (
            <button 
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="border border-rose-100 text-rose-500 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Status Tracker */}
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                idx <= currentStepIndex 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step}
              </div>
              {idx < steps.length - 1 && <div className="mx-1 h-[2px] w-4 bg-slate-100" />}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 no-print">{error}</div>}

      {/* Main Form Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden print:shadow-none print:border-none">
        <div className="p-10 space-y-10">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{receipt.reference}</h1>
                <div className="h-1.5 w-16 bg-indigo-600 rounded-full" />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Receive From</label>
                  <p className="text-xl font-bold text-slate-800">{receipt.vendor}</p>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Responsible</label>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                       <User size={12} className="text-slate-400" />
                    </div>
                    <span>Administrator</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:text-right">
               <div className="flex flex-col md:items-end">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Destination Location</label>
                  <p className="text-lg font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl w-fit">
                    {receipt.destinationLocation?.warehouse?.shortCode} / {receipt.destinationLocation?.name}
                  </p>
               </div>
               <div className="flex flex-col md:items-end">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Date Created</label>
                  <p className="text-slate-600 font-bold">{new Date(receipt.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-10 border-t border-slate-50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
               <Box size={18} className="text-indigo-600" /> Products List
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Product</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-2">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {receipt.items.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-2">
                        <p className="font-bold text-slate-800 text-lg">{item.product.name}</p>
                        <p className="text-xs text-slate-400 font-mono font-bold mt-0.5">[{item.product.sku}]</p>
                      </td>
                      <td className="py-6 px-2 text-right">
                        <span className="text-2xl font-black text-slate-900 leading-none">{item.quantity}</span>
                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.product.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {receipt.status === 'Draft' && (
              <button className="mt-8 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-2 transition-colors border-b-2 border-transparent hover:border-indigo-100 pb-1 w-fit no-print">
                 + New Product
              </button>
            )}
          </div>
        </div>

        {/* Footer info - show only on Done */}
        {receipt.status === 'Done' && (
          <div className="bg-emerald-50/30 p-10 mt-10 border-t border-emerald-50">
            <div className="flex items-center gap-4 text-emerald-700 font-bold">
               <CheckCircle2 size={24} />
               <div>
                  <p className="text-sm">This receipt has been validated and stock levels have been updated.</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Processed by System on {new Date().toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
