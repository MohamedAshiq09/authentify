'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  registerBiometric, 
  authenticateBiometric, 
  isBiometricSupported,
  getStoredCredentials,
  deleteCredential,
  type BiometricCredential
} from '@/lib/utils/biometric';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Smartphone, 
  Shield, 
  QrCode,
  Key,
  Clock,
  User,
  Loader2
} from 'lucide-react';

interface BiometricAuthProps {
  userEmail?: string;
  userName?: string;
  onRegisterSuccess?: (credential: BiometricCredential) => void;
  onAuthSuccess?: (result: { user: any; accessToken: string; refreshToken: string }) => void;
  mode?: 'register' | 'authenticate' | 'both';
  token?: string;
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

type AuthenticatorType = 'platform' | 'cross-platform';

interface DeviceCapabilities {
  hasPlatformAuthenticator: boolean;
  supportsCrossPlatform: boolean;
  isSecureContext: boolean;
  userAgent: string;
}

export function BiometricAuth({
  userEmail = '',
  userName = '',
  onRegisterSuccess,
  onAuthSuccess,
  mode = 'both',
  token,
  className = '',
  showTitle = true,
  compact = false,
}: BiometricAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<BiometricCredential[]>([]);
  const [selectedAuthType, setSelectedAuthType] = useState<AuthenticatorType>('platform');
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const isSupported = isBiometricSupported();
  const hasRegistered = credentials.length > 0;

  // Detect device capabilities
  useEffect(() => {
    detectDeviceCapabilities();
  }, []);

  // Load credentials on mount
  useEffect(() => {
    if (token) {
      loadCredentials();
    }
  }, [token]);

  const detectDeviceCapabilities = async () => {
    const capabilities: DeviceCapabilities = {
      hasPlatformAuthenticator: false,
      supportsCrossPlatform: true,
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
    };

    // Check for platform authenticator
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      try {
        capabilities.hasPlatformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      } catch (error) {
        console.warn('Could not detect platform authenticator:', error);
      }
    }

    setDeviceCapabilities(capabilities);
    
    // Auto-select best authenticator type
    if (!capabilities.hasPlatformAuthenticator) {
      setSelectedAuthType('cross-platform');
    }
  };

  const loadCredentials = async () => {
    if (!token) return;
    try {
      const creds = await getStoredCredentials(token);
      setCredentials(creds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const handleRegister = async (authType: AuthenticatorType = selectedAuthType) => {
    if (!userEmail || !userName) {
      setError('Email and name are required for registration');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Requesting biometric registration...', { authType, userEmail });
      
      if (authType === 'cross-platform') {
        setShowQRCode(true);
      }

      const credential = await registerBiometric(userEmail, userName, authType);
      console.log('Biometric registered successfully:', credential);
      
      const successMessage = authType === 'platform' 
        ? 'Biometric credential registered successfully!' 
        : 'Passkey registered successfully!';
      
      setSuccess(successMessage);
      setShowQRCode(false);
      
      if (token) {
        await loadCredentials();
      }
      onRegisterSuccess?.(credential);
    } catch (err: any) {
      console.error('Registration error:', err);
      setShowQRCode(false);
      
      let errorMessage = err.message || 'Failed to register biometric';
      
      // Provide helpful error messages
      if (errorMessage.includes('NotAllowedError')) {
        errorMessage = 'Registration was cancelled or not allowed. Please try again.';
      } else if (errorMessage.includes('NotSupportedError')) {
        errorMessage = 'This device does not support the requested authentication method.';
      } else if (errorMessage.includes('SecurityError')) {
        errorMessage = 'Security error. Please ensure you are on a secure connection (HTTPS).';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!userEmail) {
        setError('Email is required for authentication');
        return;
      }

      console.log('Requesting authentication options...');
      console.log('Calling startAuthentication...');
      const result = await authenticateBiometric(userEmail);
      console.log('Authentication successful:', result);
      
      setSuccess(`Authenticated successfully!`);
      if (token) {
        await loadCredentials();
      }
      onAuthSuccess?.(result);
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // If no credentials are registered, offer to register
      if (err.message && err.message.includes('No biometric credentials')) {
        setError('No biometric credentials found. Would you like to set up biometric authentication?');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (credentialId: string) => {
    if (!token) {
      setError('Authentication required to delete credentials');
      return;
    }

    if (confirm('Are you sure you want to delete this biometric credential?')) {
      try {
        await deleteCredential(credentialId, token);
        await loadCredentials();
        setSuccess('Credential deleted successfully');
      } catch (error: any) {
        setError(error.message || 'Failed to delete credential');
      }
    }
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not supported on this device or browser.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isSupported) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not supported on this device or browser.
          Please use a modern browser with HTTPS connection.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && !compact && (
        <div className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50"></div>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Secure Authentication</h3>
          <p className="text-sm text-gray-600 mt-1">
            Use your fingerprint, face, or security key to authenticate
          </p>
        </div>
      )}

      {/* Device Capabilities */}
      {deviceCapabilities && !compact && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Device Capabilities</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                {deviceCapabilities.hasPlatformAuthenticator ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                )}
                <span className={deviceCapabilities.hasPlatformAuthenticator ? 'text-green-700' : 'text-orange-700'}>
                  Biometric Sensor
                </span>
              </div>
              <div className="flex items-center gap-1">
                {deviceCapabilities.supportsCrossPlatform ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span className={deviceCapabilities.supportsCrossPlatform ? 'text-green-700' : 'text-red-700'}>
                  External Keys
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authentication Type Selection */}
      {(mode === 'register' || mode === 'both') && deviceCapabilities && !compact && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Choose Authentication Method</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedAuthType === 'platform' 
                  ? 'ring-2 ring-purple-500 border-purple-200' 
                  : 'hover:border-gray-300'
              } ${!deviceCapabilities.hasPlatformAuthenticator ? 'opacity-50' : ''}`}
              onClick={() => deviceCapabilities.hasPlatformAuthenticator && setSelectedAuthType('platform')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Fingerprint className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">Biometric</h5>
                    <p className="text-xs text-gray-500">Touch ID, Face ID, Fingerprint</p>
                  </div>
                  {selectedAuthType === 'platform' && (
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  )}
                </div>
                {!deviceCapabilities.hasPlatformAuthenticator && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Not Available
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                selectedAuthType === 'cross-platform' 
                  ? 'ring-2 ring-blue-500 border-blue-200' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedAuthType('cross-platform')}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">Security Key</h5>
                    <p className="text-xs text-gray-500">USB, NFC, or QR Code</p>
                  </div>
                  {selectedAuthType === 'cross-platform' && (
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Error and Success Messages */}
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

      {/* QR Code Display */}
      {showQRCode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h4 className="font-medium text-blue-900 mb-2">Scan with your device</h4>
            <p className="text-sm text-blue-700 mb-4">
              Use your phone's camera or authenticator app to scan this QR code
            </p>
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300">
              <div className="text-xs text-gray-500 font-mono">
                QR Code would appear here in production
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {(mode === 'register' || mode === 'both') && (
          <div className="space-y-2">
            <Button
              onClick={() => handleRegister(selectedAuthType)}
              disabled={isLoading || !userEmail || !userName}
              className={`w-full h-12 ${
                selectedAuthType === 'platform'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
              }`}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : selectedAuthType === 'platform' ? (
                <Fingerprint className="mr-2 h-5 w-5" />
              ) : (
                <Key className="mr-2 h-5 w-5" />
              )}
              {isLoading 
                ? 'Setting up...' 
                : selectedAuthType === 'platform' 
                  ? 'Register Biometric' 
                  : 'Register Security Key'
              }
            </Button>
            
            {selectedAuthType === 'cross-platform' && (
              <p className="text-xs text-gray-500 text-center">
                You'll be prompted to use your security key or scan a QR code
              </p>
            )}
          </div>
        )}

        {(mode === 'authenticate' || mode === 'both') && (
          <>
            {hasRegistered ? (
              <Button
                onClick={handleAuthenticate}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Authenticating...' : 'Authenticate'}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  No biometric credentials found for this account.
                </p>
                <Button
                  onClick={() => handleRegister(selectedAuthType)}
                  disabled={isLoading || !userEmail || !userName}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? 'Setting up...' : 'Set Up Biometric Authentication'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Registered Credentials */}
      {credentials.length > 0 && !compact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4" />
              Registered Credentials ({credentials.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your registered authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {credentials.map((cred, index) => (
              <div
                key={cred.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Fingerprint className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Credential #{index + 1}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(cred.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Used {cred.counter} times
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cred.credential_id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!hasRegistered && mode !== 'register' && (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">
            No authentication methods registered yet.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Register your biometric or security key to get started.
          </p>
        </div>
      )}
    </div>
  );
}
