'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function CartHeader() {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href="/cart" className="flex items-center hover:text-saffron transition-colors relative">
      <ShoppingCart className="h-5 w-5 mr-1" />
      <span className="hidden sm:inline">Cart</span>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-3 sm:-right-2 bg-saffron text-white text-xs font-bold px-1.5 py-0.5 rounded-full border border-navy">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
