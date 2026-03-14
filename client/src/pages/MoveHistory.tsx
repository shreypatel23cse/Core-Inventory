import { useQuery } from '@tanstack/react-query';
import { movesApi } from '../services/api';
import { History, Search } from 'lucide-react';
import { useState } from 'react';

export default function MoveHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: moves, isLoading } = useQuery({ queryKey: ['moves'], queryFn: async () => (await movesApi.list()).data });

  const filteredMoves = moves?.filter((m: any) => 
    m.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by Reference or Product..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reference</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Movement</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMoves?.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(m.date).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{m.reference}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm">{m.product.name}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 italic">{m.sourceLocation || 'None'}</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-xs font-medium text-slate-700 italic">{m.destinationLocation || 'None'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{m.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-slate-400">Loading history...</div>}
        {filteredMoves?.length === 0 && !isLoading && <div className="p-8 text-center text-slate-400">No records found.</div>}
      </div>
    </div>
  );
}
