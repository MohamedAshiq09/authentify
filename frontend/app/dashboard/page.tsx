'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { useContract } from '@/hooks/use-contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Wallet, 
  LogOut, 
  User, 
  Mail, 
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { formatAddress } from '@/lib/polkadot/wallet';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { selectedAccount } = useWallet();
  const { getUserIdentity, isContractAvailable } = useContract();
  
  const [contractIdentity, setContractIdentity] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Fetch contract identity
    const fetchIdentity = async () => {
      if (user && selectedAccount) {
        try {
          const identity = await getUserIdentity(selectedAccount.address, selectedAccount.address);
          setContractIdentity(identity);
        } catch (error) {
          console.error('Failed to fetch contract identity:', error);
        }
      }
    };

    fetchIdentity();
  }, [user, selectedAccount, getUserIdentity]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Authentify</h1>
                <p className="text-xs text-gray-500">Decentralized Identity</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="border-2">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600">Manage your decentralized identity and account settings</p>
        </div>

        {/* Status Alerts */}
        {isContractAvailable && contractIdentity && (
          <Alert className="mb-6 border-green-200 bg-green-50 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <span className="font-semibold">Identity verified on-chain</span> - Your decentralized identity is active on the Polkadot blockchain
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">On-Chain</p>
                  <p className="text-2xl font-bold text-gray-900">Verified</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Auth Method</p>
                  <p className="text-2xl font-bold text-gray-900">Email</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Security</p>
                  <p className="text-2xl font-bold text-gray-900">High</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="shadow-lg border-2 animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                  <CardDescription>Your account details and settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Verified
                  </span>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">User ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm text-gray-900 break-all">{user.id}</p>
                      <button
                        onClick={() => copyToClipboard(user.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full border-2">
                  Edit Profile Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="shadow-lg border-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow">
                  <Wallet className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Wallet Information</CardTitle>
                  <CardDescription>Your blockchain wallet details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {selectedAccount ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-2">Wallet Address</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-gray-900 break-all flex-1">
                        {selectedAccount.address}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedAccount.address)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-2">Account Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedAccount.meta.name || 'Unnamed Account'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Network</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="font-semibold text-gray-900">Polkadot</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <a
                      href={`https://polkadot.subscan.io/account/${selectedAccount.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full border-2">
                        View on Explorer
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No wallet connected</p>
                  <Button variant="outline" className="border-2">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blockchain Identity Card */}
        {contractIdentity && (
          <Card className="mt-6 shadow-lg border-2 border-purple-200 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Blockchain Identity</CardTitle>
                  <CardDescription>Your on-chain identity details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contract Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-gray-900">Registered</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verification</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-gray-900">Verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-6 shadow-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col border-2 hover:border-purple-200 hover:bg-purple-50">
                <Shield className="h-6 w-6 mb-2 text-purple-600" />
                <span>Security Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col border-2 hover:border-blue-200 hover:bg-blue-50">
                <Activity className="h-6 w-6 mb-2 text-blue-600" />
                <span>Activity Log</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col border-2 hover:border-green-200 hover:bg-green-50">
                <ExternalLink className="h-6 w-6 mb-2 text-green-600" />
                <span>API Documentation</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}