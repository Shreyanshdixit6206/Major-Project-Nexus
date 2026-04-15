'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateAadhaarOTP, verifyAadhaarOTP } from '@/lib/aadhaarApi';
import { signJwt } from '@/app/actions';

export interface User {
  name: string;
  aadhaarNumber: string;
  phone: string;
  abhaId?: string;
}

interface AuthContextType {
  user: User | null;
  loginStep: 'input_aadhaar' | 'input_otp' | 'authenticated';
  phonePreview: string | null;
  sendOtp: (aadhaar: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (aadhaar: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  resetLogin: () => void;
  isLoaded: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginStep, setLoginStep] = useState<'input_aadhaar' | 'input_otp' | 'authenticated'>('input_aadhaar');
  const [phonePreview, setPhonePreview] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus-user');
    const savedToken = localStorage.getItem('nexus-jwt');
    if (saved && savedToken) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setToken(savedToken);
        setLoginStep('authenticated');
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const sendOtp = async (aadhaar: string) => {
    const result = await generateAadhaarOTP(aadhaar);
    if (result.success && result.phonePreview) {
      setPhonePreview(result.phonePreview);
      setLoginStep('input_otp');
    }
    return result;
  };

  const verifyOtp = async (aadhaar: string, otp: string) => {
    const result = await verifyAadhaarOTP(aadhaar, otp);
    if (result.success && result.user) {
      const jwtToken = await signJwt(result.user.abhaId || '');
      setUser(result.user);
      setToken(jwtToken);
      setLoginStep('authenticated');
      localStorage.setItem('nexus-user', JSON.stringify(result.user));
      localStorage.setItem('nexus-jwt', jwtToken);
    }
    return result;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoginStep('input_aadhaar');
    setPhonePreview(null);
    localStorage.removeItem('nexus-user');
    localStorage.removeItem('nexus-jwt');
  };

  const resetLogin = () => {
    setLoginStep('input_aadhaar');
    setPhonePreview(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginStep, phonePreview, sendOtp, verifyOtp, logout, resetLogin, isLoaded, token }}>
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
