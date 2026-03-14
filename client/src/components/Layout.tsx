import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse,
  MapPin,
  Box,
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  profile: any;
  onLogout: () => void;
}

export default function Layout({ profile, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Warehouses', icon: Warehouse, path: '/warehouses' },
    { name: 'Locations', icon: MapPin, path: '/locations' },
    { name: 'Stock', icon: Box, path: '/stock' },
    { name: 'Receipts', icon: ArrowDownLeft, path: '/receipts' },
    { name: 'Deliveries', icon: ArrowUpRight, path: '/deliveries' },
    { name: 'Transfers', icon: RefreshCw, path: '/transfers' },
    { name: 'Move History', icon: History, path: '/move-history' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || profile?.role === 'Admin');

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-stone-200 transition-all duration-300 flex flex-col z-20",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-100">
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight text-stone-900">CoreInventory</span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-stone-50 rounded-lg text-stone-500 transition-colors"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-xl transition-all group relative font-medium text-sm",
                  isActive 
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-200" 
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-stone-400 group-hover:text-stone-600")} />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className={cn(
            "flex items-center p-2.5 rounded-xl bg-stone-50 border border-stone-100",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs font-bold text-stone-900 truncate">{profile?.name}</p>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest leading-none">{profile?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className={cn(
              "w-full mt-2 flex items-center px-3 py-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-3 text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center px-8 justify-between shrink-0 z-10">
          <h1 className="font-bold text-stone-900 uppercase tracking-tighter text-lg">
            {navItems.find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'Inventory'}
          </h1>
          <div className="flex items-center space-x-4">
             <div className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em]">
               {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
