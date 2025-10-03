
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { mockApiService } from '../services/mockApiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (userData: Omit<User, 'id' | 'role'>) => Promise<User | null>;
  logout: () => void;
  updatePassword: (userId: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    const loggedInUser = await mockApiService.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    return loggedInUser;
  };

  const signup = async (userData: Omit<User, 'id' | 'role'>): Promise<User | null> => {
    const newUser = await mockApiService.signup(userData);
    if (newUser) {
      setUser(newUser);
    }
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const updatePassword = async (userId: string, newPass: string): Promise<boolean> => {
      return await mockApiService.updatePassword(userId, newPass);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
