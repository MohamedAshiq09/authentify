'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Fingerprint, 
  Key, 
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus,
  Smartphone,
  Lock,
  Users
} from 'lucide-react';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import { UserSidebar } from '@/components/user/sidebar';
import { SDKClientManager } from '@/components/sdk/sdk-client-manager';
import { sdkApi } from '@/lib/api/sdk';

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
  const [activeSection, setActiveSection] = useState('overview');
  const [userStats, setUserStats] = useState<{ total_users: number } | null>(null);

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

      // Load user statistics for SDK clients
      try {
        const clientsResponse = await fetch(`${API_URL}/sdk-client/clients`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          const clients = clientsData.data?.clients || [];
          
          if (clients.length > 0) {
            // Get stats for the first client (or you could aggregate all clients)
            const firstClient = clients[0];
            const statsResponse = await fetch(`${API_URL}/sdk-client/clients/${firstClient.client_id}/stats`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              setUserStats(statsData.data);
            }
          }
        }
      } catch (statsError) {
        console.warn('Could not load user statistics:', statsError);
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

  const renderOverviewContent = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Authentify Project</h1>
        <div className="text-sm text-gray-400">Project ID</div>
      </div>

      {/* User Details Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">User Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">EMAIL</div>
            <div className="text-lg font-mono text-white break-all">{user?.email}</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">ACCOUNT CREATED</div>
            <div className="text-lg text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          {user?.wallet_address && (
            <div className="p-4 rounded-lg bg-gray-900 border border-gray-800 md:col-span-2">
              <div className="text-xs text-gray-400 mb-1">WALLET ADDRESS</div>
              <div className="text-lg font-mono text-white break-all">{user.wallet_address}</div>
            </div>
          )}
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">SECURITY LEVEL</div>
            <div className="text-lg font-bold text-green-400">
              {biometricCredentials.length > 0 ? 'High' : 'Medium'}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">BIOMETRIC METHODS</div>
            <div className="text-lg font-bold text-purple-400">{biometricCredentials.length}</div>
          </div>
        </div>
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
      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <Users className="h-3 w-3" />
            TOTAL USERS
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {userStats?.total_users ?? 0}
          </div>
          <div className="text-xs text-gray-400">Authenticated Users</div>
        </div>
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
  );

  const renderAuthContent = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Authentication Settings</h1>
        <div className="text-sm text-gray-400">Manage your security settings</div>
      </div>

      {/* Biometric Authentication Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-pink-400" />
              Biometric Authentication
            </h2>
            <p className="text-gray-400 mt-1">
              Secure your account with fingerprint, face recognition, or security keys
            </p>
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

        {biometricCredentials.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 p-4 bg-gray-800 rounded-full w-fit">
              <Lock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Biometric Authentication Not Enabled
            </h3>
            <p className="text-gray-400 mb-4 max-w-md mx-auto">
              Add an extra layer of security to your account with biometric authentication. 
              Use your fingerprint, face, or security key to login quickly and securely.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="flex items-center gap-1 bg-gray-800 text-gray-300">
                <Smartphone className="h-3 w-3" />
                Touch ID
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-gray-800 text-gray-300">
                <Smartphone className="h-3 w-3" />
                Face ID
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1 bg-gray-800 text-gray-300">
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
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-400">
                Biometric authentication is enabled
              </span>
            </div>
            
            {/* Show biometric setup for adding more methods */}
            {showBiometricSetup && (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-white">Add Another Biometric Method</h4>
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
                className="mb-4 border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Method
              </Button>
            )}
          </div>
        )}

        {/* Biometric Setup Component */}
        {showBiometricSetup && biometricCredentials.length === 0 && (
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 mt-4">
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
                className="text-gray-400 hover:text-white"
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
  );

  const renderAPIContent = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">API Management</h1>
        <div className="text-sm text-gray-400">Manage your SDK clients and API keys</div>
      </div>

      <SDKClientManager token={token || ''} />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewContent();
      case 'auth':
        return renderAuthContent();
      case 'api':
        return renderAPIContent();
      default:
        return (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-pink-400" />
            {/* <span className="text-sm text-gray-400">Authentify / Acme Corp / First Authentify project</span> */}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <UserSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        {/* Main Content */}
        {renderContent()}
      </div>
    </div>
  );
}