'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
  medicine: any; // We just pass the mapped item
}

export default function AddToCartButton({ medicine }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleAdd = () => {
    addToCart(medicine, quantity);
    setIsAdded(true);
    
    // Reset quantity and animation state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center justify-between border border-slate-200 rounded overflow-hidden bg-white">
        <button 
          onClick={handleDecrease}
          className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
        <button 
          onClick={handleIncrease}
          className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          disabled={quantity >= 99}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <button 
        onClick={handleAdd}
        disabled={isAdded}
        className={`w-full text-center flex justify-center items-center text-sm font-bold text-white py-2 rounded shadow-sm transition-all duration-300 ${
          isAdded ? 'bg-green-600 scale-95' : 'bg-saffron hover:bg-orange-500'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="h-4 w-4 mr-2 animate-bounce" /> Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" /> Add {quantity > 1 ? quantity : ''} to Cart
          </>
        )}
      </button>
    </div>
  );
}
