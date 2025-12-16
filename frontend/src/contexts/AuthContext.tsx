import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getStoredAuth = () => {
    if (typeof window === 'undefined') {
      return { token: null, user: null };
    }
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return {
      token: storedToken,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  };

  const storedAuth = getStoredAuth();
  
  const [user, setUser] = useState<User | null>(storedAuth.user);
  const [token, setToken] = useState<string | null>(storedAuth.token);
  const [isLoading, setIsLoading] = useState(!storedAuth.token || !storedAuth.user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && user) {
        setIsLoading(false);
        return;
      }

      // Para desenvolvimento: obter token válido do backend
      try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
        console.log('🔐 Buscando token de desenvolvimento de:', `${API_URL}/auth/dev-token`);
        const response = await fetch(`${API_URL}/auth/dev-token`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Token obtido com sucesso');
          setToken(data.access_token);
          setUser(data.user);
          setError(null);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setIsLoading(false);
        } else {
          const errorText = await response.text();
          const errorMessage = `Falha ao obter token de autenticação (${response.status}): ${errorText}`;
          console.error('❌ Erro ao obter token de desenvolvimento:', response.status, errorText);
          setError(errorMessage);
          setIsLoading(false);
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? `Erro ao inicializar autenticação: ${error.message}`
          : 'Erro desconhecido ao inicializar autenticação';
        console.error('❌ Erro ao inicializar autenticação:', error);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setError(null);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

