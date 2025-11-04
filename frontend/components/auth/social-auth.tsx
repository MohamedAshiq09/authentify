'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Chrome, Github, Twitter, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SocialAuthProps {
  onSocialAuth?: (provider: string) => void;
  mode?: 'login' | 'register' | 'link';
  className?: string;
}

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  available: boolean;
}

const socialProviders: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: Chrome,
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50',
    available: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    color: 'text-gray-900',
    hoverColor: 'hover:bg-gray-50',
    available: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-blue-400',
    hoverColor: 'hover:bg-blue-50',
    available: false, // Coming soon
  },
];

export function SocialAuth({ onSocialAuth, mode = 'login', className }: SocialAuthProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSocialAuth = async (provider: SocialProvider) => {
    if (!provider.available) {
      setError(`${provider.name} authentication is coming soon!`);
      return;
    }

    setLoadingProvider(provider.id);
    setError(null);
    setSuccess(null);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would:
      // 1. Redirect to OAuth provider
      // 2. Handle callback
      // 3. Exchange code for tokens
      // 4. Create/link account
      
      setSuccess(`${provider.name} authentication successful!`);
      onSocialAuth?.(provider.id);
    } catch (error: any) {
      setError(`Failed to authenticate with ${provider.name}. Please try again.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const getButtonText = (provider: SocialProvider) => {
    switch (mode) {
      case 'register':
        return `Sign up with ${provider.name}`;
      case 'link':
        return `Link ${provider.name}`;
      default:
        return `Continue with ${provider.name}`;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {socialProviders.map((provider) => {
          const Icon = provider.icon;
          const isLoading = loadingProvider === provider.id;
          
          return (
            <Button
              key={provider.id}
              variant="outline"
              onClick={() => handleSocialAuth(provider)}
              disabled={isLoading || !provider.available}
              className={`h-12 border-2 transition-all ${provider.hoverColor} ${
                !provider.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Icon className={`mr-2 h-5 w-5 ${provider.color}`} />
                  {getButtonText(provider)}
                  {!provider.available && (
                    <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </div>

      {mode === 'link' && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Link your social accounts for easier login and enhanced security.
          </p>
        </div>
      )}

      {mode === 'register' && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing up with a social provider, you agree to our{' '}
            <a href="/terms" className="text-purple-600 hover:text-purple-700 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-purple-600 hover:text-purple-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      )}

      {/* Development Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🚧 OAuth integration is in development. Currently shows demo flow.
        </p>
      </div>
    </div>
  );
}