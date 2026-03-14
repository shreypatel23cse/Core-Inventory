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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">System Settings</h2>
            <p className="text-[var(--muted-foreground)] text-sm font-serif italic">Configure your warehouses and storage locations.</p>
          </div>
        </div>
        
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          <Database size={14} />
          <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </button>
      </div>

      <div className="flex space-x-1 p-1 bg-[var(--muted)] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'warehouses' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Warehouses
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'locations' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
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
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[var(--muted)] rounded-lg text-primary">
                  <WarehouseIcon size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)] opacity-50 uppercase tracking-widest">{w.code}</span>
              </div>
              <h3 className="font-bold text-[var(--foreground)] mb-1">{w.name}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">{w.address}</p>
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                  {locations.filter(l => l.warehouseId === w.id).length} Locations
                </span>
                <button className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          <button className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-[var(--muted-foreground)] hover:border-primary hover:text-primary transition-all group">
            <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Add Warehouse</span>
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--muted)]/50">
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
                  <td className="data-value font-mono font-bold text-primary">{l.code}</td>
                  <td className="data-value text-[var(--foreground)]">{l.name}</td>
                  <td className="data-value text-[var(--muted-foreground)]">
                    {warehouses.find(w => w.id === l.warehouseId)?.name || 'Unknown'}
                  </td>
                  <td className="data-value">
                    <span className="capitalize text-xs px-2 py-0.5 bg-[var(--muted)] rounded text-[var(--muted-foreground)] border border-[var(--border)]">
                      {l.type}
                    </span>
                  </td>
                  <td className="data-value text-right">
                    <button className="text-[var(--muted-foreground)] hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--muted-foreground)] font-serif italic">
                    No locations defined.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-[var(--muted)]/50 border-t border-[var(--border)]">
            <button className="flex items-center space-x-2 text-xs font-bold text-[var(--foreground)] uppercase tracking-widest hover:text-primary transition-colors">
              <Plus size={14} />
              <span>Add New Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
