import React, { createContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';
import { getUnseenCount } from '../api/applications';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const response = await getMe();
          setUser(response.user);
          // Load unseen notification count for applicant
          if (response.user.role === 'applicant') {
            try {
              const unseen = await getUnseenCount();
              setUnseenCount(unseen.count || 0);
            } catch (e) {
              setUnseenCount(0);
            }
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setUnseenCount(0);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Refresh unseen count when tab becomes active (no aggressive polling)
  useEffect(() => {
    const handleFocus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'applicant') return;

      try {
        const unseen = await getUnseenCount();
        setUnseenCount(unseen.count || 0);
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleFocus();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const refreshUnseenCount = async () => {
    if (!user || user.role !== 'applicant') return;
    try {
      const unseen = await getUnseenCount();
      setUnseenCount(unseen.count || 0);
    } catch (e) {
      setUnseenCount(0);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'applicant') {
      // Fetch unseen count on login
      refreshUnseenCount();
    } else {
      setUnseenCount(0);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnseenCount(0);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, unseenCount, refreshUnseenCount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

