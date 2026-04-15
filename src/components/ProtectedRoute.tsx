'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace('/auth');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-navy border-t-saffron rounded-full animate-spin"></div>
          <span className="text-navy font-bold mt-4">Verifying Secure Access...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
