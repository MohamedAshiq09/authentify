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
  Lock,
  Activity,
  Database,
  Zap,
  Users,
  BarChart3
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-red-900 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-pink-400" />
            <span className="text-sm text-gray-400">Authentify / Acme Corp / First Authentify project</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black border-r border-gray-800 min-h-screen">
          <div className="p-6">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">BUILD</div>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 text-white text-sm flex items-center gap-3 hover:bg-gray-700 transition-colors">
                <Activity className="h-4 w-4" />
                Overview
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Shield className="h-4 w-4" />
                Auth
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Database className="h-4 w-4" />
                Databases
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Zap className="h-4 w-4" />
                Functions
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Database className="h-4 w-4" />
                Storage
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-gray-400 text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors">
                <Users className="h-4 w-4" />
                Messaging
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Authentify Project</h1>
            <div className="text-sm text-gray-400">Project ID</div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-sm text-gray-400 mb-1">Bandwidth</div>
              <div className="text-4xl font-bold">1.19 <span className="text-lg text-gray-400">GB</span></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Requests</div>
              <div className="text-4xl font-bold">2K</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 flex items-end gap-1 mb-8">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: 0.6 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">DATABASES</div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-gray-400">Databases</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1">STORAGE</div>
              <div className="text-2xl font-bold">8.0 <span className="text-sm">MB</span></div>
              <div className="text-xs text-gray-400">Storage</div>
            </div>
          </div>

          {/* Hidden Biometric Section - Preserve functionality */}
          <div className="hidden">
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

          {/* Logout Button */}
          <div className="mt-8">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}