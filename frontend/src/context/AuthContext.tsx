'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'super-admin' | 'admin' | 'staff' | 'user';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  requestOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; isNewUser?: boolean; message?: string }>;
  resendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (name: string, email: string, googleId: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const API_URL = '/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (value: unknown): UserData | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<UserData> & { role?: string };
  const role = candidate.role === 'super-admin' ? 'super-admin' : candidate.role;

  if (
    !candidate._id ||
    !candidate.name ||
    !candidate.email ||
    !candidate.token ||
    (role !== 'super-admin' && role !== 'admin' && role !== 'staff' && role !== 'user')
  ) {
    return null;
  }

  return {
    _id: candidate._id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    role,
    token: candidate.token,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('sri_sakthi_user');
    if (savedUser) {
      try {
        const parsedUser = normalizeUser(JSON.parse(savedUser));
        if (parsedUser) {
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
      }
    }
    setLoading(false);
  }, []);

  const storeUser = (value: unknown) => {
    const normalized = normalizeUser(value);
    if (!normalized) {
      return false;
    }

    setUser(normalized);
    localStorage.setItem('sri_sakthi_user', JSON.stringify(normalized));
    return true;
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        const userPayload = {
          ...data.user,
          token: data.token
        };
        if (!storeUser(userPayload)) {
          return { success: false, message: 'Invalid login response format.' };
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const register = async (name: string, email: string, phone: string, password?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        const userPayload = {
          ...data.user,
          token: data.token
        };
        if (!storeUser(userPayload)) {
          return { success: false, message: 'Invalid registration response format.' };
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const requestOTP = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'OTP request failed.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'OTP resend failed.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        if (data.isNewUser) {
          // New user, OTP is verified but registration form submission is required next.
          return { success: true, isNewUser: true, message: data.message };
        }
        
        // Existing user, logged in directly
        const userPayload = {
          ...data.user,
          token: data.token
        };
        if (!storeUser(userPayload)) {
          return { success: false, message: 'Invalid verification response payload.' };
        }
        return { success: true, isNewUser: false, message: data.message };
      }
      return { success: false, message: data.message || 'Invalid OTP code.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const googleLogin = async (name: string, email: string, googleId: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId, email, name }),
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        const userPayload = {
          ...data.user,
          token: data.token
        };
        if (!storeUser(userPayload)) {
          return { success: false, message: 'Invalid Google login response format.' };
        }
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Google Auth failed.' };
    } catch {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sri_sakthi_user');
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (user && user.token) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        requestOTP,
        verifyOTP,
        resendOTP,
        googleLogin,
        logout,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
