'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RazorpayDummyPopup from '@/components/RazorpayDummyPopup';
import { createOrder } from '@/app/actions';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CheckoutPage() {
  const { cart, total, clearCart, isLoaded } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  
  const [showPayment, setShowPayment] = useState(false);
  const [creating, setCreating] = useState(false);

  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  useEffect(() => {
    // If cart is empty, send back to store
    if (isLoaded && cart.length === 0 && !successOrderId) {
      router.replace('/store');
    }
  }, [cart, router, isLoaded, successOrderId]);

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Please fill out all delivery details.");
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setShowPayment(false);
    setCreating(true);
    
    // Simulate associating dummy payment ID or transaction status
    console.log("Dummy payment successful. ID:", paymentId);
    
    const orderId = await createOrder(total, cart, name, address, phone, user?.abhaId);
    
    if (orderId) {
      setSuccessOrderId(orderId);
      clearCart();
      router.push(`/track?id=${orderId}`);
    } else {
      alert("Payment was successful but order creation failed. Please contact support.");
      setCreating(false);
    }
  };

  // Prevent flash while redirecting if empty
  if (!isLoaded || cart.length === 0) return null;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-navy mb-8 border-b-2 border-saffron inline-block pb-2">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Form */}
        <div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Delivery Details</h2>
            <form onSubmit={handleProceedToPay}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    required
                    className="w-full border-slate-300 rounded p-2 focus:ring-navy focus:border-navy border" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e)=>setPhone(e.target.value)}
                    required
                    className="w-full border-slate-300 rounded p-2 focus:ring-navy focus:border-navy border" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Complete Delivery Address</label>
                  <textarea 
                    value={address}
                    onChange={(e)=>setAddress(e.target.value)}
                    required
                    rows={4}
                    className="w-full border-slate-300 rounded p-2 focus:ring-navy focus:border-navy border resize-none" 
                  ></textarea>
                </div>
              </div>
              <button 
                type="submit"
                disabled={creating}
                className="w-full mt-6 bg-navy text-white font-bold py-3 rounded shadow hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sticky top-24">
            <h3 className="text-lg font-bold text-navy mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.brand_name || 'Generic Medicine'}</p>
                    <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    ₹{(item.price_inr * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-lg font-bold">
              <span className="text-navy">Total to Pay</span>
              <span className="text-india-green">₹{total.toFixed(2)}</span>
            </div>
            
            {creating && (
              <div className="mt-4 text-center text-sm text-saffron font-bold animate-pulse">
                Generating Final Invoice & Connecting Node...
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <RazorpayDummyPopup 
          amount={total} 
          userName={name}
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
    </div>
    </ProtectedRoute>
  );
}
