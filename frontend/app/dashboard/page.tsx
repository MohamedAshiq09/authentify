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
  Zap,
  Settings,
  TrendingUp,
  Database
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-lg opacity-50"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Authentify</h1>
                <p className="text-xs text-muted-foreground">Decentralized Identity</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="btn-secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user.email.split('@')[0]}</span>! 👋
          </h2>
          <p className="text-muted-foreground text-lg">Manage your decentralized identity and account settings</p>
        </div>

        {/* Status Alert */}
        {isContractAvailable && contractIdentity && (
          <Alert className="mb-6 border-green-500/20 bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <AlertDescription className="text-green-300">
              <span className="font-semibold">Identity verified on-chain</span> - Your decentralized identity is active on the Polkadot blockchain
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-dark border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                  <p className="text-3xl font-bold">Active</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Activity className="h-7 w-7 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-dark border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">On-Chain</p>
                  <p className="text-3xl font-bold">Verified</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-dark border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Auth Method</p>
                  <p className="text-3xl font-bold">Email</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Shield className="h-7 w-7 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-dark border-l-4 border-l-pink-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Security</p>
                  <p className="text-3xl font-bold">High</p>
                </div>
                <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
                  <Zap className="h-7 w-7 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <Card className="card-dark border-border/50">
            <CardHeader className="border-b border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <User className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Profile Information</CardTitle>
                  <CardDescription>Your account details and settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Verified</span>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-border/50">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-mono text-sm break-all">{user.id}</p>
                      <button
                        onClick={() => copyToClipboard(user.id)}
                        className="p-1.5 hover:bg-secondary rounded transition-colors"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-semibold">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button variant="outline" className="w-full btn-secondary">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="card-dark border-border/50">
            <CardHeader className="border-b border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Wallet className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Wallet Information</CardTitle>
                  <CardDescription>Your blockchain wallet details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {selectedAccount ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm break-all flex-1">
                        {selectedAccount.address}
                      </p>
                      <button
                        onClick={() => copyToClipboard(selectedAccount.address)}
                        className="p-2 hover:bg-secondary rounded transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Account Name</p>
                    <p className="font-semibold">{selectedAccount.meta.name || 'Unnamed Account'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Network</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="font-semibold">Polkadot</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <a
                      href={`https://polkadot.subscan.io/account/${selectedAccount.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full btn-secondary">
                        View on Explorer
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-6">No wallet connected</p>
                  <Button variant="outline" className="btn-secondary">
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
          <Card className="mt-6 card-dark border-primary/20">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Blockchain Identity</CardTitle>
                  <CardDescription>Your on-chain identity details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Contract Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <p className="font-semibold">Registered</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Verification</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <p className="font-semibold">Verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-6 card-dark">
          <CardHeader>
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex-col btn-secondary card-hover">
                <Settings className="h-8 w-8 mb-2 text-purple-400" />
                <span>Security Settings</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col btn-secondary card-hover">
                <TrendingUp className="h-8 w-8 mb-2 text-blue-400" />
                <span>Activity Log</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col btn-secondary card-hover">
                <Database className="h-8 w-8 mb-2 text-green-400" />
                <span>API Documentation</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}