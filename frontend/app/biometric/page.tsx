'use client';

import { useState } from 'react';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Fingerprint, 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Lock,
  Zap,
  User,
  Loader2
} from 'lucide-react';
import axios from 'axios';

export default function BiometricPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [activeDemo, setActiveDemo] = useState<'register' | 'authenticate' | null>(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const isFormValid = email && name && email.includes('@') && password.length >= 8;

  const handleUserRegistration = async () => {
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
      });

      setUserRegistered(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
      setRegistrationError(errorMessage);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Authentify Biometric Demo</h1>
              <p className="text-sm text-gray-600">Experience next-generation authentication</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Demo */}
          <div className="space-y-6">
            <Card className="border-2 border-purple-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-50"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                    <Fingerprint className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Try Biometric Authentication
                </CardTitle>
                <CardDescription className="text-base">
                  Test our secure biometric system with your device
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {/* User Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="demo@authentify.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-2 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Display Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Demo User"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 border-2 focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500">
                      Must contain uppercase, lowercase, and number
                    </p>
                  </div>
                </div>

                {/* Registration Error */}
                {registrationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{registrationError}</AlertDescription>
                  </Alert>
                )}

                {/* User Registration Step */}
                {isFormValid && !userRegistered && (
                  <div className="space-y-3">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        First, create a user account to enable biometric registration.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={handleUserRegistration}
                      disabled={isRegistering}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <User className="mr-2 h-4 w-4" />
                          Create User Account
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Demo Controls */}
                {isFormValid && userRegistered && (
                  <div className="space-y-3">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Account created! Now you can register biometric authentication.
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setActiveDemo('register')}
                        variant={activeDemo === 'register' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Register Biometric
                      </Button>
                      <Button
                        onClick={() => setActiveDemo('authenticate')}
                        variant={activeDemo === 'authenticate' ? 'default' : 'outline'}
                        className="flex-1"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Authenticate
                      </Button>
                    </div>
                  </div>
                )}

                {/* Biometric Component */}
                {isFormValid && userRegistered && activeDemo && (
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-4">
                    <BiometricAuth
                      userEmail={email}
                      userName={name}
                      mode={activeDemo}
                      showTitle={false}
                      onRegisterSuccess={(credential) => {
                        console.log('Registration successful:', credential);
                      }}
                      onAuthSuccess={(result) => {
                        console.log('Authentication successful:', result);
                        alert(`Welcome back! Authentication successful.`);
                      }}
                    />
                  </div>
                )}

                {!isFormValid && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Please enter a valid email, name, and password (8+ characters with uppercase, lowercase, and number) to try the demo.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Information */}
          <div className="space-y-6">
            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Platform Biometrics</h4>
                      <p className="text-sm text-gray-600">Touch ID, Face ID, Windows Hello</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Cross-Platform Keys</h4>
                      <p className="text-sm text-gray-600">USB security keys, NFC, QR codes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Secure Storage</h4>
                      <p className="text-sm text-gray-600">Server-side credential management</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Multi-Device</h4>
                      <p className="text-sm text-gray-600">Register multiple authenticators</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                  Device Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Mobile</h4>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-xs">iOS Safari 13+</Badge>
                      <Badge variant="secondary" className="text-xs">Android Chrome 67+</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Desktop</h4>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-xs">macOS Safari 13+</Badge>
                      <Badge variant="secondary" className="text-xs">Windows Edge 18+</Badge>
                      <Badge variant="secondary" className="text-xs">Chrome 67+</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Shield className="h-5 w-5" />
                  Security Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Biometric data never leaves your device
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Public key cryptography for verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Replay attack protection with counters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    HTTPS required for secure communication
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Requirements:</strong> This demo requires a modern browser with WebAuthn support 
                and either a built-in biometric sensor or an external security key.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
