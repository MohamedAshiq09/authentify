'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

// Dynamically import LoginForm to avoid SSR issues
const LoginForm = dynamic(() => import('@/components/auth/login-form').then(mod => ({ default: mod.LoginForm })), {
  loading: () => <div className="flex justify-center items-center min-h-screen"><Spinner /></div>,
  ssr: false
});

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}