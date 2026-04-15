'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserCircle } from 'lucide-react';

export default function AuthNav() {
  const { user, loginStep, logout } = useAuth();
  
  return (
    <>
      {loginStep === 'authenticated' && user ? (
        <div className="flex items-center space-x-4">
          <a href="/orders" className="hover:text-saffron transition-colors text-white font-bold text-xs flex items-center mr-2">
             My Orders
          </a>
          <span className="text-saffron font-bold flex items-center cursor-default">
            <UserCircle className="w-4 h-4 mr-1" />
            {user.name.split(' ')[0]}
          </span>
          <button 
            onClick={logout} 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs tracking-widest font-bold ml-2 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <a href="/auth" className="bg-white text-navy px-4 py-1.5 rounded-sm font-bold shadow hover:bg-slate-100 transition-colors inline-block tracking-wider uppercase">
            Login
          </a>
        </div>
      )}
    </>
  );
}
