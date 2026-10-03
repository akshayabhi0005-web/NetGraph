import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, pass: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: 'usr_netgraph_001',
  name: 'Akshay N',
  email: 'akshay.n@netgraph.edu',
  role: 'Data Mining Scholar',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('netgraph_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to unauthenticated so public landing page is shown first as required
    return null;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, pass: string, remember: boolean = true) => {
    // Frontend mock validation
    if (!email || !pass) {
      return { success: false, error: 'Please enter both email and password.' };
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const loggedUser: AuthUser = {
      id: 'usr_netgraph_001',
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'Registered Researcher',
    };

    setUser(loggedUser);
    if (remember) {
      localStorage.setItem('netgraph_auth_user', JSON.stringify(loggedUser));
    }
    return { success: true };
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (!name || !email || !pass) {
      return { success: false, error: 'All fields are required.' };
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'Student Researcher',
    };

    setUser(newUser);
    localStorage.setItem('netgraph_auth_user', JSON.stringify(newUser));
    return { success: true };
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    localStorage.setItem('netgraph_auth_user', JSON.stringify(DEMO_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('netgraph_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        demoLogin,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
