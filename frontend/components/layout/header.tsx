'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Wallet,
  Code,
  Home
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedAccount, isConnected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'SDK', href: '/sdk', icon: Code },
  ];

  const userNavigation = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    : [
        { name: 'Login', href: '/login', icon: User },
        { name: 'Register', href: '/register', icon: User },
      ];

  return (
    <header className={`bg-white border-b shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Authentify</span>
              <div className="text-xs text-gray-500">Polkadot Auth</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wallet Status */}
            {isConnected && selectedAccount && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Wallet className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {selectedAccount.meta.name || 'Connected'}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.email.split('@')[0]}
                </span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t my-2"></div>

              {/* User Navigation */}
              {userNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Logout for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}

              {/* Wallet Status */}
              {isConnected && selectedAccount && (
                <div className="px-3 py-2 border-t mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span>Wallet: {selectedAccount.meta.name || 'Connected'}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1 truncate">
                    {selectedAccount.address}
                  </div>
                </div>
              )}

              {/* User Info */}
              {isAuthenticated && user && (
                <div className="px-3 py-2 border-t mt-2">
                  <div className="text-sm text-gray-600">
                    Signed in as <span className="font-medium">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}