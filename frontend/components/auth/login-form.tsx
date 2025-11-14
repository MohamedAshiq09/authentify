'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { hashPassword } from '@/lib/utils/password';
import { isValidEmail } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SocialAuth } from '@/components/auth/social-auth';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Github, Twitter } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showTitle?: boolean;
  className?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
  showTitle = true,
  className
}: LoginFormProps) {
  const router = useRouter();
  const { contractLogin, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await contractLogin(formData.username, formData.password);

      // Handle remember me functionality
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('rememberUsername', formData.username);
        } else {
          localStorage.removeItem('rememberUsername');
        }
      }

      onSuccess?.();
      router.push(redirectTo);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSocialAuth = (provider: string) => {
    // This would typically redirect to OAuth provider
    console.log(`Social auth with ${provider}`);
    alert(`Social authentication with ${provider} will be implemented soon!`);
  };

  // Load remembered username on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedUsername = localStorage.getItem('rememberUsername');
      if (rememberedUsername) {
        setFormData(prev => ({ ...prev, username: rememberedUsername }));
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <Card className={`max-w-sm mx-auto bg-black border-gray-800 ${className}`}>
      {showTitle && (
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <img
              src="/logo.png"
              alt="Authentify Logo"
              className="w-18 h-18 mx-auto rounded-lg"
            />
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (formErrors.username) {
                  setFormErrors({ ...formErrors, username: '' });
                }
              }}
              className="h-10"
              error={formErrors.username}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formErrors.password) {
                    setFormErrors({ ...formErrors, password: '' });
                  }
                }}
                className="h-10 pr-10"
                error={formErrors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
            isLoading={isLoading}
          >
            {!isLoading && "Sign In"}
          </Button>
        </form>

        {/* Social Login Icons */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-pink-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleSocialAuth('google')}
            className="p-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
          <button
            onClick={() => handleSocialAuth('github')}
            className="p-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Github className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => handleSocialAuth('twitter')}
            className="p-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
          </button>
        </div>

        {/* Simplified Biometric */}
        {formData.username && formData.username.length >= 3 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-pink-400">Or use biometric</span>
              </div>
            </div>

            <Button
              onClick={async () => {
                try {
                  // Simplified biometric auth call
                  console.log('Biometric auth for:', formData.username);
                  alert('Biometric authentication will be implemented soon!');
                } catch (error) {
                  console.error('Biometric auth failed:', error);
                }
              }}
              variant="outline"
              className="w-full h-10 border-gray-600 text-white hover:bg-gray-800"
            >
              <Shield className="mr-2 h-4 w-4" />
              Use Biometric
            </Button>
          </>
        )}

        {/* Register Link */}
        <div className="text-center pt-4 border-t border-gray-600">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign up →
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}