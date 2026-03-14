import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  History, 
  Settings as SettingsIcon,
  LogOut,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function Layout({ profile, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Receipts', icon: ArrowDownLeft, path: '/operations/receipt' },
    { name: 'Deliveries', icon: ArrowUpRight, path: '/operations/delivery' },
    { name: 'Transfers', icon: RefreshCw, path: '/operations/internal' },
    { name: 'Move History', icon: History, path: '/move-history' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || profile?.role === 'admin');

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-stone-200 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-stone-900">CoreInventory</span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-stone-100 rounded-md text-stone-500"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-all group",
                  isActive 
                    ? "bg-stone-900 text-white" 
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-stone-400 group-hover:text-stone-600")} />
                {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className={cn(
            "flex items-center p-2 rounded-lg",
            isSidebarOpen ? "bg-stone-50" : "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
              <UserIcon size={16} />
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs font-semibold text-stone-900 truncate">{profile?.displayName || 'User'}</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">{profile?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full mt-2 flex items-center px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center px-8 justify-between shrink-0">
          <h1 className="font-serif italic text-lg text-stone-500">
            {navItems.find(i => i.path === location.pathname)?.name || 'Inventory'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-stone-400 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ profile }} />
        </div>
      </main>
    </div>
  );
}
