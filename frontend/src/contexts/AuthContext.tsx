import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [token, setToken] = useState<string | null>(storedToken);
  const [isLoading, setIsLoading] = useState(!storedToken || !storedUser);

  useEffect(() => {
    const initializeAuth = async () => {
      const currentToken = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');

      if (currentToken && currentUser) {
        setToken(currentToken);
        setUser(JSON.parse(currentUser));
        setIsLoading(false);
        return;
      }

      // Para desenvolvimento: obter token válido do backend
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        console.log('🔐 Buscando token de desenvolvimento de:', `${API_URL}/auth/dev-token`);
        const response = await fetch(`${API_URL}/auth/dev-token`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Token obtido com sucesso');
          setToken(data.access_token);
          setUser(data.user);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          const errorText = await response.text();
          console.error('❌ Erro ao obter token de desenvolvimento:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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

