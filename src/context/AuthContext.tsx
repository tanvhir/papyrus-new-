import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loggedIn: boolean;
  installed: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me.php');
      const data = await res.json();
      
      if (data.code === 'INSTALLER_NEEDED' || data.installed === false) {
        setInstalled(false);
      } else {
        setInstalled(true);
        if (data.success && data.loggedIn) {
          setUser(data.user);
          setLoggedIn(true);
        } else {
          setUser(null);
          setLoggedIn(false);
        }
      }
    } catch (err) {
      console.error('Core Auth status fetch failed:', err);
      // Fallback: stay as guest if API errors or offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setLoggedIn(true);
        return true;
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout.php', { method: 'POST' });
    } catch (err) {
      console.error('Session clearance network failure, clearing client state anyway:', err);
    } finally {
      setUser(null);
      setLoggedIn(false);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, installed, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be utilized cleanly inside an AuthProvider scope.');
  }
  return context;
};
