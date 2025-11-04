'use client';

import Link from 'next/link';
import { Shield, Github, Twitter, Mail, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'SDK', href: '/sdk' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Community', href: '/community' },
      { name: 'Help Center', href: '/help' },
      { name: 'Status', href: '/status' },
      { name: 'Changelog', href: '/changelog' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security', href: '/security' },
    ],
  };

  const social = [
    {
      name: 'GitHub',
      href: 'https://github.com/yourusername/authentify',
      icon: Github,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/authentify',
      icon: Twitter,
    },
    {
      name: 'Email',
      href: 'mailto:hello@authentify.dev',
      icon: Mail,
    },
  ];

  return (
    <footer className={`bg-gray-900 text-gray-300 ${className}`}>
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Authentify</span>
                <div className="text-xs text-purple-400">Polkadot Authentication</div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Decentralized identity authentication system built on Polkadot. 
              Secure, scalable, and developer-friendly.
            </p>
            <div className="flex space-x-4">
              {social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Sections */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hackathon Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-6 border border-purple-800/30">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🏆 Polkadot Hackathon 2024 Project
                </h3>
                <p className="text-purple-200">
                  Built with ❤️ for the Polkadot ecosystem. Open source and production-ready.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://polkadot.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Learn about Polkadot
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://github.com/yourusername/authentify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                >
                  <Github className="h-4 w-4" />
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 text-gray-400 mb-4 md:mb-0">
              <span>&copy; {currentYear} Authentify.</span>
              <span>Built with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for developers.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>MIT License</span>
              <span>•</span>
              <span>Open Source</span>
              <span>•</span>
              <a
                href="/status"
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                All systems operational
              </a>
            </div>
          </div>
        </div>

        {/* Developer Attribution */}
        <div className="text-center mt-8 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a
              href="https://polkadot.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Polkadot
            </a>
            {' • '}
            <a
              href="https://use.ink"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              ink! Smart Contracts
            </a>
            {' • '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Next.js
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}