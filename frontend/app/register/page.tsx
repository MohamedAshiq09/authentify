'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

// Dynamically import SimpleRegisterForm to avoid SSR issues
const SimpleRegisterForm = dynamic(() => import('@/components/auth/simple-register-form').then(mod => ({ default: mod.SimpleRegisterForm })), {
  loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>,
  ssr: false
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-sm">
        <SimpleRegisterForm />
      </div>
    </div>
  );
}