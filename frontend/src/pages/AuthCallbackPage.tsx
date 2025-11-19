import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      authService
        .getProfile(token)
        .then((user) => {
          login(token, user);
          navigate('/chat');
        })
        .catch(() => {
          setError('Erro ao processar login. Tente novamente.');
          setTimeout(() => navigate('/login'), 3000);
        });
    } else {
      setError('Token não encontrado. Redirecionando...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Processando login...</p>
    </div>
  );
};

