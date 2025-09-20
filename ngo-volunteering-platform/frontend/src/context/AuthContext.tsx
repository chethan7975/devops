'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'volunteer' | 'ngo') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = Cookies.get('token');
    const storedUser = Cookies.get('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'volunteer' | 'ngo') => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/auth/login', {
        email,
        password,
        role,
      });

      const { token: authToken, user: userData } = response.data;

      // Store auth data
      Cookies.set('token', authToken, { expires: 30 }); // 30 days
      Cookies.set('user', JSON.stringify(userData), { expires: 30 });

      setToken(authToken);
      setUser(userData);

      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data
    Cookies.remove('token');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
    
    toast.success('Logged out successfully');
  };

  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};