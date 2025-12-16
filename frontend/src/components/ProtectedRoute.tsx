import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // TEMPORÁRIO: Login desabilitado para desenvolvimento
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
};

