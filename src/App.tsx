/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from './services/api';
import { UserProfile } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Operations from './pages/Operations';
import MoveHistory from './pages/MoveHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Components
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authApi.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await authApi.getProfile();
        setProfile(userProfile);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogin = (userProfile: UserProfile) => {
    setProfile(userProfile);
  };

  const handleLogout = () => {
    authApi.logout();
    setProfile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-100">
        <div className="text-stone-500 animate-pulse font-medium">Loading CoreInventory...</div>
      </div>
    );
  }

  const isAuthenticated = !!profile;

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <SignUp onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
          
          <Route element={isAuthenticated ? <Layout profile={profile} onLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/operations/:type" element={<Operations />} />
            <Route path="/move-history" element={<MoveHistory />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
