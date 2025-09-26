import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  role: 'user' | 'admin';
}

interface DecodedToken {
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser(decoded.user);
        localStorage.setItem('token', token);
      } catch (error) {
        console.error("Invalid token", error);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    navigate('/dashboard'); // Navigate after setting token
  };

  const logout = () => {
    setToken(null);
    navigate('/login'); // Navigate after clearing token
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is the new hook that all components will use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};