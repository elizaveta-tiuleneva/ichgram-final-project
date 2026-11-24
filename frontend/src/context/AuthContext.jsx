import { useEffect, useState } from 'react';

import { AuthContext } from './authContext.js';

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../services/auth.service.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 404
        ) {
          localStorage.removeItem('token');
        }

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    const data = await registerUser(userData);

    localStorage.setItem('token', data.token);
    setUser(data.user);

    return data;
  };

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    localStorage.setItem('token', data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};