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
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  profile: any;
  onLogout: () => void;
}

export default function Layout({ profile, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
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
    <div className="flex h-screen overflow-hidden bg-[var(--background)] font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 flex flex-col z-20",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain dark:invert border border-[var(--border)] rounded-lg p-0.5" />
              <span className="font-black text-[var(--foreground)] uppercase tracking-tighter text-sm">CoreInventory</span>
            </div>
          ) : (
            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain mx-auto dark:invert" />
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] transition-colors"
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
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className={cn(
            "flex items-center p-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)]",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-sm">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs font-bold text-[var(--foreground)] truncate">{profile?.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-bold tracking-widest leading-none">{profile?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className={cn(
              "w-full mt-2 flex items-center px-3 py-2.5 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all",
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
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center px-8 justify-between shrink-0 z-10">
          <h1 className="font-bold text-[var(--foreground)] uppercase tracking-tighter text-lg">
            {navItems.find(i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'Inventory'}
          </h1>
          <div className="flex items-center space-x-6">
             <div className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-[0.2em] hidden md:block">
               {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
             </div>
             
             <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-primary transition-colors flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-[var(--background)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
