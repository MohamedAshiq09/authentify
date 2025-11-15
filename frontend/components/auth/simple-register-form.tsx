'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { validatePassword, getPasswordStrength } from '@/lib/utils/password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import {
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  Twitter,
  CheckCircle2,
  Fingerprint,
  Wallet
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface SimpleRegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showTitle?: boolean;
  className?: string;
}

export function SimpleRegisterForm({
  onSuccess,
  redirectTo = '/dashboard',
  showTitle = true,
  className
}: SimpleRegisterFormProps) {
  const router = useRouter();
  const { contractRegister, isLoading, error } = useAuth();
  const { selectedAccount, isConnected, connect, isLoading: walletLoading } = useWallet();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message || 'Invalid password';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!isConnected || !selectedAccount) {
      errors.wallet = 'Please connect your wallet first';
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
      // Create social ID hash
      const socialIdHash = `local:${formData.username}:${Date.now()}`;

      // Register using contract-based authentication
      await contractRegister({
        username: formData.username,
        password: formData.password,
        walletAddress: selectedAccount!.address,
        socialIdHash,
        socialProvider: 'local',
      });

      setRegistrationComplete(true);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Social auth with ${provider}`);
    alert(`Social authentication with ${provider} will be implemented soon!`);
  };

  const handleBiometricComplete = () => {
    setShowBiometricSetup(false);
    onSuccess?.();
    router.push(redirectTo);
  };

  const handleSkipBiometric = () => {
    onSuccess?.();
    router.push(redirectTo);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-600';
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (registrationComplete) {
    return (
      <Card className={`max-w-sm mx-auto bg-black border-gray-800 ${className}`}>
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <img
              src="/logo.png"
              alt="Authentify Logo"
              className="w-38 h-20 mx-auto rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="text-center py-4">
            <div className="mx-auto mb-4 p-3 bg-green-900 rounded-full w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Account Created!</h3>
            <p className="text-gray-400 text-sm mb-6">
              Your account has been successfully created.
            </p>
          </div>

          {/* Optional Biometric Setup */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">Optional: Set Up Biometric (Skip for Now)</span>
            </div>
          </div>

          {!showBiometricSetup ? (
            <div className="flex gap-3">
              <Button
                onClick={handleSkipBiometric}
                variant="outline"
                className="flex-1 h-10 border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                Skip for Now
              </Button>
              <Button
                onClick={() => setShowBiometricSetup(true)}
                className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Set Up
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <BiometricAuth
                userEmail={`${formData.username}@authentify.local`}
                userName={formData.username}
                mode="register"
                showTitle={false}
                compact={true}
                onRegisterSuccess={handleBiometricComplete}
              />
              <Button
                onClick={handleSkipBiometric}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Skip Biometric Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const renderCompactWalletConnect = () => {
    if (isConnected && selectedAccount) {
      return (
        <div className="p-3 bg-green-900 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
          <div className="text-xs text-green-400 mt-1 font-mono">
            {selectedAccount.address.slice(0, 10)}...{selectedAccount.address.slice(-8)}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Button
          onClick={async () => {
            try {
              await connect();
              setFormErrors({});
            } catch (error) {
              console.error('Failed to connect wallet:', error);
            }
          }}
          variant="outline"
          className="w-full h-10 border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
          disabled={walletLoading}
        >
          {walletLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center">
          Connect your Polkadot.js extension
        </p>
      </div>
    );
  };

  return (
    <Card className={`max-w-sm mx-auto bg-black border-gray-800 ${className}`}>
      {showTitle && (
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <img
              src="/logo.png"
              alt="Authentify Logo"
              className="w-38 h-20 mx-auto rounded-lg"
            />
          </div>
        </CardHeader>
      )}

      <CardContent className="space-y-4 p-6">
        {/* Compact Wallet Connection */}
        <div className="space-y-2">
          {renderCompactWalletConnect()}
          {formErrors.wallet && (
            <p className="text-red-400 text-sm">{formErrors.wallet}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-fade-in bg-red-900 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">{error}</AlertDescription>
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
            {formData.password && (
              <div className="space-y-1">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (formErrors.confirmPassword) {
                    setFormErrors({ ...formErrors, confirmPassword: '' });
                  }
                }}
                className="h-10 pr-10"
                error={formErrors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? (
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
            {!isLoading && "Create Account"}
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

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-gray-600">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}