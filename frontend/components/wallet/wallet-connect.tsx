'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Wallet, CheckCircle2, AlertCircle, Download, ExternalLink } from 'lucide-react';

interface WalletConnectProps {
  onConnected?: () => void;
  showTitle?: boolean;
  className?: string;
}

export function WalletConnect({ onConnected, showTitle = true, className }: WalletConnectProps) {
  const {
    isConnected,
    accounts,
    selectedAccount,
    isExtensionAvailable,
    isLoading,
    error,
    connect,
    disconnect,
  } = useWallet();

  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      onConnected?.();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isExtensionAvailable) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Polkadot Wallet
            </CardTitle>
            <CardDescription>Connect your Polkadot.js extension</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50">
            <Download className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 font-semibold">Extension Required</AlertTitle>
            <AlertDescription className="text-orange-800">
              Please install the Polkadot.js browser extension to connect your wallet.
              <a
                href="https://polkadot.js.org/extension/"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-orange-600 hover:text-orange-700 font-semibold underline flex items-center gap-1"
              >
                Download Extension
                <ExternalLink className="h-4 w-4" />
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && selectedAccount) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Wallet Connected
            </CardTitle>
            <CardDescription>Your Polkadot wallet is connected</CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Account:</span>{' '}
                  {selectedAccount.meta.name || 'Unnamed Account'}
                </div>
                <div className="font-mono text-sm break-all">
                  {selectedAccount.address}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="flex-1"
            >
              Disconnect
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`https://polkadot.subscan.io/account/${selectedAccount.address}`, '_blank')}
              className="flex-1"
            >
              View on Explorer
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription>Connect your Polkadot.js extension to continue</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center py-6">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Polkadot Wallet</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            We'll use your wallet address to create your decentralized identity on the blockchain.
          </p>

          <Button
            onClick={handleConnect}
            disabled={isLoading || isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            size="lg"
          >
            {(isLoading || isConnecting) ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Connect Polkadot Wallet
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Make sure you have accounts in your Polkadot.js extension</p>
        </div>
      </CardContent>
    </Card>
  );
}