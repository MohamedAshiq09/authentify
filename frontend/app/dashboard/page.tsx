'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  User, 
  Settings, 
  Fingerprint, 
  Key, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus,
  Smartphone,
  Lock
} from 'lucide-react';
import { BiometricAuth } from '@/components/auth/biometric-auth';

interface UserProfile {
  id: string;
  email: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

interface BiometricCredential {
  id: string;
  credential_id: string;
  counter: number;
  created_at: string;
  last_used: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [biometricCredentials, setBiometricCredentials] = useState<BiometricCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }
    setToken(accessToken);
    loadUserProfile(accessToken);
  }, [router]);

  const loadUserProfile = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Load user profile
      const profileResponse = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await profileResponse.json();
      setUser(profileData.data.user);

      // Load biometric credentials
      try {
        const biometricResponse = await fetch(`${API_URL}/biometric/credentials`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (biometricResponse.ok) {
          const biometricData = await biometricResponse.json();
          setBiometricCredentials(biometricData.data.credentials || []);
        }
      } catch (biometricError) {
        console.warn('Could not load biometric credentials:', biometricError);
      }

    } catch (error: any) {
      setError(error.message);
      if (error.message.includes('unauthorized')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  const handleBiometricSuccess = () => {
    setShowBiometricSetup(false);
    if (token) {
      loadUserProfile(token);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Authentify Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Created</label>
                  <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded border">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {user?.wallet_address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded border break-all">
                    {user.wallet_address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Level</p>
                    <p className="text-2xl font-bold text-green-600">
                      {biometricCredentials.length > 0 ? 'High' : 'Medium'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Biometric Methods</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {biometricCredentials.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Fingerprint className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Biometric Authentication Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5" />
                    Biometric Authentication
                  </CardTitle>
                  <CardDescription>
                    Secure your account with fingerprint, face recognition, or security keys
                  </CardDescription>
                </div>
                {biometricCredentials.length === 0 && (
                  <Button 
                    onClick={() => setShowBiometricSetup(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Enable Biometric
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {biometricCredentials.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Biometric Authentication Not Enabled
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Add an extra layer of security to your account with biometric authentication. 
                    Use your fingerprint, face, or security key to login quickly and securely.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      Touch ID
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Smartphone className="h-3 w-3" />
                      Face ID
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      Security Keys
                    </Badge>
                  </div>
                  {!showBiometricSetup && (
                    <Button 
                      onClick={() => setShowBiometricSetup(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                    >
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Set Up Biometric Authentication
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Biometric authentication is enabled
                    </span>
                  </div>
                  
                  {/* Show biometric setup for adding more methods */}
                  {showBiometricSetup && (
                    <div className="border-2 border-dashed border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3">Add Another Biometric Method</h4>
                      <BiometricAuth
                        userEmail={user?.email || ''}
                        userName={user?.email?.split('@')[0] || ''}
                        mode="register"
                        token={token || ''}
                        showTitle={false}
                        compact={true}
                        onRegisterSuccess={handleBiometricSuccess}
                      />
                    </div>
                  )}
                  
                  {!showBiometricSetup && (
                    <Button 
                      onClick={() => setShowBiometricSetup(true)}
                      variant="outline"
                      className="mb-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Method
                    </Button>
                  )}
                </div>
              )}

              {/* Biometric Setup Component */}
              {showBiometricSetup && biometricCredentials.length === 0 && (
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-6">
                  <BiometricAuth
                    userEmail={user?.email || ''}
                    userName={user?.email?.split('@')[0] || ''}
                    mode="register"
                    token={token || ''}
                    showTitle={false}
                    onRegisterSuccess={handleBiometricSuccess}
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

              {/* Existing Credentials Management */}
              {biometricCredentials.length > 0 && (
                <BiometricAuth
                  userEmail={user?.email || ''}
                  userName={user?.email?.split('@')[0] || ''}
                  mode="authenticate"
                  token={token || ''}
                  showTitle={false}
                  compact={true}
                  onAuthSuccess={(result) => {
                    console.log('Biometric auth successful:', result);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}