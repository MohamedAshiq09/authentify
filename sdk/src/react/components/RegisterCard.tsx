// @ts-nocheck
import React, { useState } from 'react';
import { AuthentifyConfig } from '../../types';
import { useAuthentify } from '../hooks';

export interface RegisterCardProps {
  config: AuthentifyConfig;
  requireWallet?: boolean;
  onSuccess?: (user?: any) => void;
  className?: string;
  title?: string;
}

export const RegisterCard: React.FC<RegisterCardProps> = ({
  config,
  requireWallet = true,
  onSuccess,
  className = '',
  title = ''
}) => {
  const { isLoading, error } = useAuthentify(config);
  const sdk = new (require('../../sdk').AuthentifySDK)(config);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      const addr = await sdk.connectWallet();
      setWalletAddress(addr);
    } catch (e: any) {
      setLocalError(e.message || 'Failed to connect wallet');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      if (requireWallet && !walletAddress) {
        setLocalError('Please connect your wallet first');
        return;
      }

      const user = await sdk.register({
        email,
        password,
        username,
        walletAddress: walletAddress || undefined,
      });

      onSuccess?.(user);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div className={`max-w-sm mx-auto bg-black border border-gray-800 rounded-xl ${className}`}>
      <div className="p-6 space-y-4">
        {title && (
          <div className="text-center">
            <img src="/logo.png" alt="Authentify" className="w-20 h-20 mx-auto rounded-lg mb-3" />
            <h2 className="text-white text-lg font-semibold">{title}</h2>
          </div>
        )}

        {(error || localError) && (
          <div className="text-sm text-red-300 bg-red-900/40 border border-red-800 rounded-md p-2">
            {localError || error}
          </div>
        )}

        {requireWallet && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={connectWallet}
              className="w-full h-10 border border-gray-700 rounded-md text-gray-200 hover:bg-gray-800"
            >
              {walletAddress ? `Connected: ${walletAddress.slice(0, 10)}...` : 'Connect Wallet'}
            </button>
            <p className="text-xs text-gray-400 text-center">Connect your Polkadot.js extension</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full h-10 px-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full h-10 px-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full h-10 px-3 rounded-md bg-transparent border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-60"
          >
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterCard;
