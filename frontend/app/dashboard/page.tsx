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
  Users,
  Database,
  Activity,
  BarChart3,
  TrendingUp,
  Globe,
  Copy,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react';
import { BiometricAuth } from '@/components/auth/biometric-auth';
import { UserSidebar } from '@/components/user/sidebar';
import { SDKClientManager } from '@/components/sdk/sdk-client-manager';

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
  const [analytics, setAnalytics] = useState<{
    total_users: number;
    active_today: number;
    total_requests: number;
    bandwidth_gb: number;
    growth_rate: number;
    databases_count: number;
    storage_mb: number;
    queries_today: number;
    avg_response_time: number;
    daily_stats: Array<{ date: string; users: number; requests: number }>;
  } | null>(null);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

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

      // Load comprehensive analytics
      try {
        const analyticsResponse = await fetch(`${API_URL}/sdk-client/analytics`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData.data);
          setUserStats({ total_users: analyticsData.data.total_users });
        }
      } catch (analyticsError) {
        console.warn('Could not load analytics:', analyticsError);
      }

      // Load SDK clients
      try {
        const clientsResponse = await fetch(`${API_URL}/sdk-client/clients`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData.data?.clients || []);
        }
      } catch (clientsError) {
        console.warn('Could not load clients:', clientsError);
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

  const renderDatabaseContent = () => (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Database Analytics</h1>
        <div className="text-sm text-gray-400">User statistics and analytics for your applications</div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-sm text-gray-400 mb-1">Bandwidth</div>
          <div className="text-4xl font-bold">{analytics?.bandwidth_gb?.toFixed(2) ?? '0.00'} <span className="text-lg text-gray-400">GB</span></div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Requests</div>
          <div className="text-4xl font-bold">{analytics?.total_requests ? (analytics.total_requests >= 1000 ? `${(analytics.total_requests / 1000).toFixed(1)}K` : analytics.total_requests) : '0'}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-pink-400" />
          Daily Analytics
        </h3>
        <div className="h-48 flex items-end gap-1 bg-gray-900 border border-gray-800 rounded-lg p-4">
          {analytics?.daily_stats?.length ? analytics.daily_stats.map((stat, i) => {
            const maxRequests = Math.max(...analytics.daily_stats.map(s => s.requests), 1);
            const height = (stat.requests / maxRequests) * 100;
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t"
                style={{
                  height: `${height}%`,
                  opacity: 0.6 + (height / 100) * 0.4,
                }}
                title={`${stat.date}: ${stat.requests} requests`}
              />
            );
          }) : Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t"
              style={{
                height: '10%',
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* User Statistics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              TOTAL USERS
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {analytics?.total_users ?? 0}
            </div>
            <div className="text-xs text-gray-400">Authenticated Users</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              ACTIVE TODAY
            </div>
            <div className="text-2xl font-bold text-green-400">
              {analytics?.active_today ?? 0}
            </div>
            <div className="text-xs text-gray-400">Active Users</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              GROWTH RATE
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {analytics?.growth_rate ? (analytics.growth_rate > 0 ? `+${analytics.growth_rate}%` : `${analytics.growth_rate}%`) : '0%'}
            </div>
            <div className="text-xs text-gray-400">This Month</div>
          </div>
        </div>
      </div>

      {/* Database Stats */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-400" />
          Database Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">DATABASES</div>
            <div className="text-2xl font-bold">{analytics?.databases_count ?? 0}</div>
            <div className="text-xs text-gray-400">Active Databases</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">STORAGE</div>
            <div className="text-2xl font-bold">{analytics?.storage_mb?.toFixed(1) ?? '0.0'} <span className="text-sm">MB</span></div>
            <div className="text-xs text-gray-400">Used Storage</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">QUERIES</div>
            <div className="text-2xl font-bold">{analytics?.queries_today ? (analytics.queries_today >= 1000 ? `${(analytics.queries_today / 1000).toFixed(1)}K` : analytics.queries_today) : '0'}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
          <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-400 mb-1">RESPONSE TIME</div>
            <div className="text-2xl font-bold">{analytics?.avg_response_time ?? 0} <span className="text-sm">ms</span></div>
            <div className="text-xs text-gray-400">Average</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeveloperContent = () => (
    <div className="flex-1 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Developer Console</h1>
        <div className="text-sm text-gray-400 mb-6">Manage your API credentials and integrations</div>

        {/* API Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{analytics?.databases_count ?? 0}</div>
            <div className="text-sm text-gray-400">Active APIs</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{analytics?.queries_today ? (analytics.queries_today >= 1000 ? `${(analytics.queries_today / 1000).toFixed(1)}K` : analytics.queries_today) : '0'}</div>
            <div className="text-sm text-gray-400">Requests Today</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{analytics?.avg_response_time ?? 0}ms</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
        </div>
      </div>

      {/* API Credentials */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">API Credentials</h3>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New API
          </Button>
        </div>

        {clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client, index) => (
              <div key={client.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{client.app_name}</h4>
                      <p className="text-sm text-gray-400">Created on {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-gray-800 text-white border-gray-700">Active</Badge>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">CLIENT ID</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm font-mono text-white">
                          {client.client_id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => navigator.clipboard.writeText(client.client_id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-2">CLIENT SECRET</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm font-mono text-white">
                          {showClientSecret ? '••••••••••••••••••••••••••••••••' : '••••••••••••••••••••••••••••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => setShowClientSecret(!showClientSecret)}
                        >
                          {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => navigator.clipboard.writeText('Hidden for security')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">AUTHORIZED REDIRECT URIS</label>
                    <div className="space-y-2">
                      {client.redirect_uris?.map((uri: string, uriIndex: number) => (
                        <div key={uriIndex} className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white">
                            {uri}
                          </code>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-800 flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white">
                    Regenerate Secret
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="font-medium text-white mb-2">No API Clients</h4>
            <p className="text-gray-400 mb-4">Create your first API client to get started</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create API Client
            </Button>
          </div>
        )}
      </div>

      {/* OAuth Integration */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">OAuth Integration</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{oauthEnabled ? 'Enabled' : 'Disabled'}</span>
            <button
              onClick={() => setOauthEnabled(!oauthEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${oauthEnabled ? 'bg-gray-700' : 'bg-gray-600'
                }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${oauthEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          {oauthEnabled ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Google</div>
                  <div className="text-xs text-white">Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">GitHub</div>
                  <div className="text-xs text-white">Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">Twitter</div>
                  <div className="text-xs text-white">Active</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Enable OAuth to allow social authentication</p>
            </div>
          )}
        </div>
      </div>
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
      case 'databases':
        return renderDatabaseContent();
      case 'developer':
        return renderDeveloperContent();
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