import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface RazorpayDummyProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
  userName: string;
}

export default function RazorpayDummyPopup({ amount, onSuccess, onClose, userName }: RazorpayDummyProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setProcessing(false);
      onSuccess("pay_" + Math.random().toString(36).substring(2, 10));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-navy text-white p-4 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg mb-1">Health Nexus Gateway</h3>
            <p className="text-sm text-slate-300">Test Payment for {userName}</p>
          </div>
          <button onClick={onClose} disabled={processing} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Box */}
        <div className="p-6 text-center border-b border-slate-100">
          <p className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-1">Payable Amount</p>
          <p className="text-3xl font-bold text-navy">₹{amount.toFixed(2)}</p>
        </div>

        {/* Methods */}
        <div className="p-6 flex-grow">
          <p className="text-sm font-bold text-slate-700 mb-4">Select Payment Method</p>
          
          <div className="space-y-3">
            <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${method === 'upi' ? 'border-navy bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="radio" checked={method === 'upi'} onChange={() => setMethod('upi')} className="mr-3 text-navy focus:ring-navy" />
              <span className="font-medium">UPI / BHIM</span>
            </label>
            <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${method === 'card' ? 'border-navy bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="radio" checked={method === 'card'} onChange={() => setMethod('card')} className="mr-3 text-navy focus:ring-navy" />
              <span className="font-medium">Credit / Debit Card</span>
            </label>
            <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${method === 'netbanking' ? 'border-navy bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="radio" checked={method === 'netbanking'} onChange={() => setMethod('netbanking')} className="mr-3 text-navy focus:ring-navy" />
              <span className="font-medium">NetBanking</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <button 
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md shadow transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {processing ? (
              <span className="animate-pulse">Processing Securely...</span>
            ) : (
              <>Pay ₹{amount.toFixed(2)}</>
            )}
          </button>
          
          <div className="mt-4 flex items-center justify-center text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 mr-1 text-green-600" />
            100% Secure & Dummy Transaction
          </div>
        </div>

      </div>
    </div>
  );
}
