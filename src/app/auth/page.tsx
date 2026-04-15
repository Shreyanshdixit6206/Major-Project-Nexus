'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { loginStep, phonePreview, sendOtp, verifyOtp, user, resetLogin } = useAuth();
  const router = useRouter();
  
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (loginStep === 'authenticated' && user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy mb-4">Welcome, {user.name}</h1>
        <p className="text-slate-600 mb-8">You are successfully logged in with ABHA ID: {user.abhaId}</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-navy text-white px-6 py-3 rounded font-bold shadow-md hover:bg-blue-900 inline-block"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setError('');
    setLoading(true);
    const res = await sendOtp(aadhaar);
    if (!res.success) {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    const res = await verifyOtp(aadhaar, otp);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border-2 border-slate-200 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Aadhaar_Logo.svg/1200px-Aadhaar_Logo.svg.png" alt="Aadhaar Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy">Health Nexus Auth</h2>
          <p className="text-slate-500 text-sm mt-1">Authenticate using your Aadhaar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        {loginStep === 'input_aadhaar' ? (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Aadhaar Number <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                maxLength={12}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="1234 5678 9012"
                className="w-full border-slate-300 rounded-md focus:ring-navy focus:border-navy p-3 border"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-navy text-white font-bold py-3 rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Generate OTP'}
            </button>
            
            <div className="mt-6 text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
              <p className="font-bold mb-1">Dummy Test Accounts:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>123456789012</li>
                <li>987654321098</li>
                <li>111122223333</li>
              </ul>
              <p className="mt-2 text-red-500">* Check server console for OTPs.</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Enter OTP <span className="text-red-500">*</span></label>
              <p className="text-xs text-slate-500 mb-3">OTP sent to your registered mobile ending in <span className="font-bold text-navy">{phonePreview}</span></p>
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full border-slate-300 rounded-md focus:ring-navy focus:border-navy p-3 border text-center text-lg tracking-widest font-mono"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-india-green text-white font-bold py-3 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>
            <button 
              type="button" 
              onClick={resetLogin}
              disabled={loading}
              className="w-full mt-3 text-slate-500 font-medium py-2 rounded hover:text-navy transition-colors disabled:opacity-50 text-sm"
            >
              Change Aadhaar Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
