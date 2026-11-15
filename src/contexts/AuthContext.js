import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (token) {
      setUser({ username: storedUsername || 'Usuário' });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('auth/login', { username, password });
    const token = response.data.token;

    localStorage.setItem('username', username);
    localStorage.setItem('accessToken', token);

    setUser({ username });
    return response.data;
  };

  const register = async (name, username, password) => {
    await api.post('auth/register', { name, username, password });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
