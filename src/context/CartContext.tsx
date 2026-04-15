'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine } from '@/app/actions';

export interface CartItem extends Medicine {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (med: Medicine, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  total: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexus-cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('nexus-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (med: Medicine, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        return prev.map(item => item.id === med.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...med, quantity }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + (item.price_inr * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, isLoaded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
