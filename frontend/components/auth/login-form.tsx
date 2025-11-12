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
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    <Card className={className}>
      {showTitle && (
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Welcome Back</CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to your Authentify account
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Username
            </label>
            <Input
              type="text"
              placeholder="your_username"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (formErrors.username) {
                  setFormErrors({ ...formErrors, username: '' });
                }
              }}
              className="h-12 text-base"
              error={formErrors.username}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (formErrors.password) {
                    setFormErrors({ ...formErrors, password: '' });
                  }
                }}
                className="h-12 text-base pr-12"
                error={formErrors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" 
              />
              <span className="text-gray-600">Remember me</span>
            </label>
            <Link 
              href="/forgot-password" 
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity shadow-lg" 
            isLoading={isLoading}
          >
            {!isLoading && (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        {/* Social Login */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <SocialAuth onSocialAuth={handleSocialAuth} />

        {/* Biometric Authentication */}
        {formData.username && formData.username.length >= 3 && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or use biometric</span>
              </div>
            </div>

            <BiometricAuth
              userEmail={`${formData.username}@authentify.local`}
              userName={formData.username}
              mode="authenticate"
              showTitle={false}
              compact={true}
              onAuthSuccess={(result) => {
                console.log('Biometric auth successful:', result);
                // Store tokens
                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                onSuccess?.();
                router.push(redirectTo);
              }}
            />
          </>
        )}

        {/* Register Link */}
        <div className="text-center pt-4 border-t">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              Sign up for free →
            </Link>
          </p>
        </div>

        {/* Additional Options */}
        <div className="text-center space-y-2">
          <Link 
            href="/help" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Need help signing in?
          </Link>
          <br />
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}