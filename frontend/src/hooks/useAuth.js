import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tradai_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    refreshUser(token);
  }, [token]);

  const refreshUser = async (currentToken = token) => {
    if (!currentToken) {
      return null;
    }

    try {
      const data = await api.me(currentToken);
      setUser(data.user || null);
      return data.user || null;
    } catch (err) {
      localStorage.removeItem('tradai_token');
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('tradai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.register({ name, email, password });
      localStorage.setItem('tradai_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tradai_token');
    setToken(null);
    setUser(null);
    setError('');
  };

  return { user, token, loading, error, login, register, logout, refreshUser };
}
