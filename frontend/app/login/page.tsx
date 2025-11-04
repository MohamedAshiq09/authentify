'use client';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-pink-200 to-purple-300 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-blue-200 to-purple-300 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <LoginForm className="shadow-2xl border-0 animate-slide-up" />
      </div>
    </div>
  );
}