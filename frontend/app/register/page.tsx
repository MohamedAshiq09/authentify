'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

// Dynamically import RegistrationWizard to avoid SSR issues
const RegistrationWizard = dynamic(() => import('@/components/auth/registration-wizard').then(mod => ({ default: mod.RegistrationWizard })), {
  loading: () => <div className="flex justify-center items-center min-h-[400px]"><Spinner /></div>,
  ssr: false
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-pink-200 to-purple-300 blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-blue-200 to-purple-300 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <RegistrationWizard className="shadow-2xl border-0 animate-slide-up" />
        
        {/* Login Link */}
        <div className="text-center pt-6 mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign in instead →
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}