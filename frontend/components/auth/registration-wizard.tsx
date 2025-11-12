'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { useContract } from '@/hooks/use-contract';
import { hashPassword, validatePassword, getPasswordStrength } from '@/lib/utils/password';
import { isValidEmail } from '@/lib/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletConnect } from '@/components/wallet/wallet-connect';
import { AccountSelector } from '@/components/wallet/account-selector';
import { SocialAuth } from '@/components/auth/social-auth';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import { 
  Shield, 
  Wallet, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  Fingerprint
} from 'lucide-react';

type Step = 'wallet' | 'social' | 'credentials' | 'complete';

interface RegistrationWizardProps {
  onComplete?: () => void;
  className?: string;
}

export function RegistrationWizard({ onComplete, className }: RegistrationWizardProps) {
  const router = useRouter();
  const { contractRegister, isLoading: authLoading } = useAuth();
  const { selectedAccount, isConnected } = useWallet();
  const { registerUser } = useContract();

  const [currentStep, setCurrentStep] = useState<Step>('wallet');
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [socialProvider, setSocialProvider] = useState<string | null>(null);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  // Auto-advance when wallet is connected
  useEffect(() => {
    if (currentStep === 'wallet' && isConnected && selectedAccount) {
      setCurrentStep('social');
    }
  }, [currentStep, isConnected, selectedAccount]);

  const handleWalletConnected = () => {
    setError(null);
    setCurrentStep('social');
  };

  const handleSocialAuth = (provider: string) => {
    setSocialProvider(provider);
    setCurrentStep('credentials');
  };

  const handleSkipSocial = () => {
    setSocialProvider(null);
    setCurrentStep('credentials');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!selectedAccount) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      // Create social ID hash
      const socialIdHash = socialProvider 
        ? `${socialProvider}:${formData.username}:${Date.now()}`
        : `local:${formData.username}:${Date.now()}`;

      // Register using contract-based authentication
      await contractRegister({
        username: formData.username,
        password: formData.password,
        walletAddress: selectedAccount.address,
        socialIdHash,
        socialProvider: socialProvider || 'local',
      });

      setCurrentStep('complete');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  const steps = [
    { id: 'wallet', label: 'Connect Wallet', icon: Wallet },
    { id: 'social', label: 'Social Auth', icon: Users },
    { id: 'credentials', label: 'Set Credentials', icon: User },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50"></div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gradient">Create Your Account</CardTitle>
        <CardDescription className="text-base mt-2">
          Get started with Authentify in 3 simple steps
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress Steps */}
        <div className="mb-8 flex justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStepIndex >= index;
            const isCompleted = currentStepIndex > index;

            return (
              <div
                key={step.id}
                className={`flex-1 text-center transition-all ${
                  isActive ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                <div className={`mb-2 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isActive
                    ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'border-gray-300 bg-white'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <p className="text-sm font-medium">{step.label}</p>
              </div>
            );
          })}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Wallet Connection */}
        {currentStep === 'wallet' && (
          <div className="animate-fade-in">
            <WalletConnect onConnected={handleWalletConnected} showTitle={false} />
          </div>
        )}

        {/* Step 2: Social Authentication */}
        {currentStep === 'social' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-2">Connect Social Account (Optional)</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Link your social accounts for easier login and enhanced security.
              </p>
            </div>

            <SocialAuth onSocialAuth={handleSocialAuth} />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('wallet')}
                className="flex-1 h-12 border-2"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                onClick={handleSkipSocial}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                Skip for Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Credentials */}
        {currentStep === 'credentials' && (
          <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
            {selectedAccount && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <span className="font-semibold">Wallet connected:</span>{' '}
                  <span className="font-mono text-sm">
                    {selectedAccount.address.slice(0, 10)}...{selectedAccount.address.slice(-8)}
                  </span>
                  {socialProvider && (
                    <>
                      <br />
                      <span className="font-semibold">Social provider:</span> {socialProvider}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <Input
                type="text"
                placeholder="your_username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="h-12 text-base"
                required
              />
              <p className="text-xs text-gray-500">
                3-32 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 text-base"
                required
              />
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Password Strength</span>
                    <span className="font-medium">{getPasswordStrengthText()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Must be 8+ characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('social')}
                className="flex-1 h-12 border-2"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                isLoading={authLoading}
              >
                {!authLoading && (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Optional Biometric Setup */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Optional: Set Up Biometric (Skip for Now)</span>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                You can set up biometric authentication now or later in your dashboard.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Skip biometric setup and go to complete
                    setCurrentStep('complete');
                  }}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowBiometricSetup(true)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Set Up Now
                </Button>
              </div>
            </div>

            {/* Biometric Setup Component */}
            {showBiometricSetup && (
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 mt-4">
                <BiometricAuth
                  userEmail={`${formData.username}@authentify.local`}
                  userName={formData.username}
                  mode="register"
                  showTitle={false}
                  compact={true}
                  onRegisterSuccess={(credential) => {
                    console.log('Biometric registered:', credential);
                    setShowBiometricSetup(false);
                    setCurrentStep('complete');
                  }}
                />
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowBiometricSetup(false)}
                    className="text-gray-500"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className="text-center space-y-6 py-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-50"></div>
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created! 🎉</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your account has been successfully created and registered on the Polkadot blockchain.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Identity Registered</p>
                  <p className="text-sm text-gray-600">Your decentralized identity is now on-chain</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Wallet Connected</p>
                  <p className="text-sm text-gray-600">Your wallet is linked to your account</p>
                </div>
              </div>
              {socialProvider && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Social Account Linked</p>
                    <p className="text-sm text-gray-600">Connected with {socialProvider}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Ready to Use</p>
                  <p className="text-sm text-gray-600">Start using Authentify authentication</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                onComplete?.();
                router.push('/dashboard');
              }}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}