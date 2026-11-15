import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--ledger-bg)] text-[var(--ledger-ink-muted)]">
        <Spinner className="size-6 text-[var(--ledger-accent)]" />
        <span className="text-sm font-medium tracking-tight">Carregando sistema...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export default PrivateRoute;
