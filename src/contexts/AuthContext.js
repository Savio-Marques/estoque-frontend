import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (token) {
      setUser({
        username: storedUsername || 'Usuário',
        name: storedName || storedUsername || 'Usuário',
        role: storedRole || 'USER',
      });

      // Sincroniza dados e role reais com o backend caso já exista token salvo
      api
        .get('auth/me')
        .then((res) => {
          if (!active || !res?.data) return;
          const { name, username, role } = res.data;
          if (name) localStorage.setItem('userName', name);
          if (username) localStorage.setItem('username', username);
          if (role) localStorage.setItem('userRole', role);
          setUser({
            username: username || storedUsername || 'Usuário',
            name: name || storedName || 'Usuário',
            role: role || storedRole || 'USER',
          });
        })
        .catch(() => {
          // O interceptor do Axios já trata 401 automaticamente
        });
    }
    setLoading(false);

    return () => {
      active = false;
    };
  }, []);

  const login = async (username, password) => {
    const response = await api.post('auth/login', { username, password });
    const { token, name, role } = response.data;

    localStorage.setItem('username', username);
    if (name) localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role || 'USER');
    localStorage.setItem('accessToken', token);

    setUser({ username, name: name || username, role: role || 'USER' });
    return response.data;
  };

  const updateUserName = (newName) => {
    localStorage.setItem('userName', newName);
    setUser((prev) => (prev ? { ...prev, name: newName } : prev));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        updateUserName,
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
