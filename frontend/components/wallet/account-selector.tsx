'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, User, Wallet, RefreshCw } from 'lucide-react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { formatAddress } from '@/lib/polkadot/wallet';

interface AccountSelectorProps {
  onAccountSelected?: (account: InjectedAccountWithMeta) => void;
  showTitle?: boolean;
  className?: string;
}

export function AccountSelector({ onAccountSelected, showTitle = true, className }: AccountSelectorProps) {
  const {
    accounts,
    selectedAccount,
    isConnected,
    isLoading,
    selectAccount,
    refreshAccounts,
  } = useWallet();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAccountSelect = (account: InjectedAccountWithMeta) => {
    selectAccount(account);
    onAccountSelected?.(account);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccounts();
    } catch (error) {
      console.error('Failed to refresh accounts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Account
            </CardTitle>
            <CardDescription>Choose which account to use</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet first to see available accounts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Account
            </CardTitle>
            <CardDescription>Choose which account to use</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Alert>
            <AlertDescription>
              No accounts found in your Polkadot.js extension. Please create an account first.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="w-full mt-4"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Accounts
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Account
              </CardTitle>
              <CardDescription>Choose which account to use for authentication</CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {accounts.map((account, index) => (
          <div
            key={account.address}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedAccount?.address === account.address
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleAccountSelect(account)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(account.meta.name || `Account ${index + 1}`).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {account.meta.name || `Account ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {account.meta.source || 'polkadot-js'}
                    </p>
                  </div>
                </div>
                <div className="ml-10">
                  <p className="font-mono text-sm text-gray-600 break-all">
                    {formatAddress(account.address, 20)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click to copy: {account.address}
                  </p>
                </div>
              </div>
              {selectedAccount?.address === account.address && (
                <CheckCircle2 className="h-6 w-6 text-purple-600 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}

        {selectedAccount && (
          <Alert className="border-green-200 bg-green-50 mt-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <span className="font-semibold">Selected:</span>{' '}
              {selectedAccount.meta.name || 'Unnamed Account'}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 text-center pt-2">
          <p>Your selected account will be used for blockchain transactions</p>
        </div>
      </CardContent>
    </Card>
  );
}