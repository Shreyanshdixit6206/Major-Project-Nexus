'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { createOrder } from '@/app/actions';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CartPage() {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const router = useRouter();
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-navy mb-8 border-b-2 border-saffron inline-block pb-2">Your Cart</h1>
      
      {cart.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">Your cart is empty.</p>
          <Link href="/store" className="mt-4 inline-block bg-navy text-white px-6 py-2 rounded font-medium hover:bg-blue-900 transition-colors">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex bg-white border border-slate-200 rounded-lg p-4 shadow-sm items-center card-animate hover-scale transition-shadow hover:shadow-md">
                <div className="flex-grow">
                  <h3 className="font-bold text-navy text-lg">{item.brand_name || 'Generic Medicine'}</h3>
                  <p className="text-sm text-slate-500">{item.primary_ingredient} {item.primary_strength}</p>
                  <p className="text-xs text-slate-400 mt-1">Manufacturer: {item.manufacturer}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-india-green text-lg">₹{(item.price_inr * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center justify-end mt-2">
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 h-fit sticky top-24 card-animate">
            <h3 className="text-xl font-bold text-navy mb-4">Order Summary</h3>
            <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-bold">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
              <span className="text-slate-600">Standard Delivery</span>
              <span className="font-bold text-india-green">FREE</span>
            </div>
            <div className="flex justify-between items-center pt-2 mb-6">
              <span className="text-lg font-bold text-navy">Total to Pay</span>
              <span className="text-2xl font-bold text-india-green">₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout} 
              className="w-full bg-navy hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-md transition-colors flex justify-center items-center"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Checkout Securely
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">Payments processed securely via National Gateway.</p>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
