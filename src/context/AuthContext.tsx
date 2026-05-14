import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage by fetching /api/auth/me
  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /** Store token and set user immediately — no extra /me round-trip needed. */
  const login = (token: string, user: User): void => {
    localStorage.removeItem('nma_admin_token');
    localStorage.setItem('nma_token', token);
    setUser(user);
  };

  /** Call the API logout, then clear local state regardless of outcome. */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Swallow — we clear state either way
    } finally {
      localStorage.removeItem('nma_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
