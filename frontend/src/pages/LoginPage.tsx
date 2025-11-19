import React from 'react';
import { authService } from '../services/auth.service';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>OrderlyAI</h1>
        <p>Faça login com sua conta Google Workspace</p>
        <button onClick={handleGoogleLogin} className="google-login-button">
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

