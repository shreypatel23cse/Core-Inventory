import { Outlet, Link, useLocation } from 'react-router-dom';
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
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

export default function Layout({ profile, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
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
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">CoreInventory</span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-[var(--muted)] rounded-md text-[var(--muted-foreground)]"
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
                    ? "bg-primary text-white shadow-sm" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-white" : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]")} />
                {isSidebarOpen && <span className="ml-3 font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className={cn(
            "flex items-center p-2 rounded-lg",
            isSidebarOpen ? "bg-[var(--muted)]" : "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] shrink-0">
              <UserIcon size={16} />
            </div>
            {isSidebarOpen && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs font-semibold text-[var(--foreground)] truncate">{profile?.displayName || 'User'}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{profile?.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full mt-2 flex items-center px-3 py-2 text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all",
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
        <header className="h-16 bg-[var(--card)] border-b border-[var(--border)] flex items-center px-8 justify-between shrink-0">
          <h1 className="font-serif italic text-lg text-[var(--muted-foreground)]">
            {navItems.find(i => i.path === location.pathname)?.name || 'Inventory'}
          </h1>
          <div className="flex items-center space-x-6">
            <div className="text-xs text-[var(--muted-foreground)] font-mono hidden md:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ profile }} />
        </div>
      </main>
    </div>
  );
}
