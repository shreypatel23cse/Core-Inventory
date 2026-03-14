import { useState, useEffect } from 'react';
import { warehousesApi, locationsApi, seedApi } from '../services/api';
import { Warehouse, Location } from '../types';
import { Settings as SettingsIcon, MapPin, Warehouse as WarehouseIcon, Plus, Trash2, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<'warehouses' | 'locations'>('warehouses');
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchData = async () => {
    try {
      const [whData, locData] = await Promise.all([
        warehousesApi.list(),
        locationsApi.list(),
      ]);
      setWarehouses(whData);
      setLocations(locData);
    } catch (err) {
      console.error('Failed to fetch settings data:', err);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedApi.seed();
      await fetchData();
      alert('Demo data seeded successfully!');
    } catch (err: any) {
      console.error('Seed error:', err);
      alert(err.message || 'Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-stone-900 text-white rounded-2xl">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">System Settings</h2>
            <p className="text-stone-500 text-sm font-serif italic">Configure your warehouses and storage locations.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          <Database size={14} />
          <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>
      </div>

      <div className="flex space-x-1 p-1 bg-stone-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'warehouses' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Warehouses
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'locations' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Locations
        </button>
      </div>

      {activeTab === 'warehouses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((w) => (
            <motion.div 
              key={w.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-stone-50 rounded-lg text-stone-400">
                  <WarehouseIcon size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">{w.code}</span>
              </div>
              <h3 className="font-bold text-stone-900 mb-1">{w.name}</h3>
              <p className="text-xs text-stone-500 mb-4">{w.address}</p>
              <div className="pt-4 border-t border-stone-50 flex justify-between items-center">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest">
                  {locations.filter(l => l.warehouseId === w.id).length} Locations
                </span>
                <button className="text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          <button className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all group">
            <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Add Warehouse</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="col-header">Location Code</th>
                <th className="col-header">Name</th>
                <th className="col-header">Warehouse</th>
                <th className="col-header">Type</th>
                <th className="col-header w-20"></th>
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l.id} className="data-row">
                  <td className="data-value font-mono font-bold text-stone-900">{l.code}</td>
                  <td className="data-value">{l.name}</td>
                  <td className="data-value text-stone-500">
                    {warehouses.find(w => w.id === l.warehouseId)?.name || 'Unknown'}
                  </td>
                  <td className="data-value">
                    <span className="capitalize text-xs px-2 py-0.5 bg-stone-100 rounded text-stone-600">
                      {l.type}
                    </span>
                  </td>
                  <td className="data-value text-right">
                    <button className="text-stone-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-stone-400 font-serif italic">
                    No locations defined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-stone-50 border-t border-stone-100">
            <button className="flex items-center space-x-2 text-xs font-bold text-stone-900 uppercase tracking-widest hover:text-stone-600 transition-colors">
              <Plus size={14} />
              <span>Add New Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
