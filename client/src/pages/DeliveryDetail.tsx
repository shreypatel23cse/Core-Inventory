import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deliveriesApi } from '../services/api';
import { ArrowLeft, Box } from 'lucide-react';

export default function DeliveryDetail() {
  const { id } = useParams();
  const { data: delivery, isLoading } = useQuery({ 
    queryKey: ['delivery', id], 
    queryFn: async () => (await deliveriesApi.list()).data.find((d: any) => d.id === id) 
  });

  if (isLoading) return <div className="p-8 text-slate-400">Loading delivery details...</div>;
  if (!delivery) return <div className="p-8 text-rose-500 font-bold">Delivery not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/deliveries" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-4">
        <ArrowLeft size={18} /> Back to Deliveries
      </Link>
      
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-50 px-2 py-1 rounded">Outgoing Delivery</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{delivery.reference}</h2>
            <p className="text-slate-400 font-medium">{delivery.customer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${
              delivery.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>{delivery.status}</span>
          </div>
        </div>

        <div className="border-t border-slate-50 pt-8">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Box size={18} className="text-slate-400" /> Items List
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 text-xs font-bold text-slate-400 uppercase">Product</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {delivery.items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 font-medium text-slate-800">{item.product.name} ({item.product.sku})</td>
                  <td className="py-4 text-right font-bold text-slate-900">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
