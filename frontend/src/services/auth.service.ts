import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const authService = {
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  getProfile: async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

