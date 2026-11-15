import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Debtors from './pages/Debtors';
import Categories from './pages/Categories';
import Users from './pages/Users';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard/stock" replace /> : children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard/stock" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Stock />} />
          <Route path="stock" element={<Stock />} />
          <Route path="debtors" element={<Debtors />} />
          <Route path="categories" element={<Categories />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
