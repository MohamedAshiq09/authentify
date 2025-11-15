// @ts-nocheck
import React, { useState } from 'react';
import { AuthentifyConfig } from '../../types';
import { useAuthentify } from '../hooks';

export interface LoginCardProps {
  config: AuthentifyConfig;
  redirectTo?: string;
  onSuccess?: (accountId?: string) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  config,
  redirectTo,
  onSuccess,
  className = '',
  title = '',
  subtitle = '',
}) => {
  const { isLoading, error } = useAuthentify(config);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Use SDK instance directly for contract auth via context-less hook
  const sdk = new (require('../../sdk').AuthentifySDK)(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const accountId = await sdk.contractAuthenticate(username, password);
      if (!accountId) {
        setLocalError('Invalid username or password');
        return;
      }
      // Optionally create on-chain session
      await sdk.contractCreateSession(accountId);
      onSuccess?.(accountId);
      if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    }
  };

  return (
    <div className={`max-w-sm mx-auto bg-black border border-gray-800 rounded-xl ${className}`}>
      <div className="p-6 space-y-4">
        {title && (
          <div className="text-center">
            <img src="/logo.png" alt="Authentify" className="w-20 h-20 mx-auto rounded-lg mb-3" />
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
          </div>
        )}

        {(error || localError) && (
          <div className="text-sm text-red-300 bg-red-900/40 border border-red-800 rounded-md p-2">
            {localError || error}
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
            {isLoading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;
