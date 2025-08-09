// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Fungsi logout terpusat
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    if (token) {
      try {
        // <-- Penambahan try-catch
        const decodedUser: User = jwtDecode(token);
        // Cek jika token sudah kedaluwarsa
        if (decodedUser.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decodedUser);
        }
      } catch (error) {
        console.error("Invalid token found in localStorage", error);
        logout(); // Hapus token yang tidak valid
      }
    }
  }, [token]);

  const login = (newToken: string) => {
    try {
      // <-- Penambahan try-catch
      const decodedUser: User = jwtDecode(newToken);
      localStorage.setItem('token', newToken);
      setUser(decodedUser);
      setToken(newToken);
    } catch (error) {
      console.error("Failed to decode new token", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
