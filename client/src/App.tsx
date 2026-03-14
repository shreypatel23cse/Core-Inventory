import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authApi } from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Locations from './pages/Locations';
import Stock from './pages/Stock';
import Receipts from './pages/Receipts';
import ReceiptDetail from './pages/ReceiptDetail';
import Deliveries from './pages/Deliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import Transfers from './pages/Transfers';
import MoveHistory from './pages/MoveHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

// Components
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="text-stone-400 animate-pulse">Initializing CoreInventory...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp setUser={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route element={user ? <Layout profile={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/receipts/:id" element={<ReceiptDetail />} />
              <Route path="/deliveries" element={<Deliveries />} />
              <Route path="/deliveries/:id" element={<DeliveryDetail />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/move-history" element={<MoveHistory />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
