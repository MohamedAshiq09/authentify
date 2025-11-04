'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Code, Book, Download, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function SDKPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const installCode = `npm install @authentify/sdk`;
  
  const quickStartCode = `import { AuthentifySDK } from '@authentify/sdk';

const authentify = new AuthentifySDK({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  apiUrl: 'https://api.authentify.dev'
});

// Register user
const user = await authentify.register({
  email: 'user@example.com',
  password: 'securePassword123',
  walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
});

// Login user
const session = await authentify.login({
  email: 'user@example.com',
  password: 'securePassword123'
});`;

  const reactCode = `import { useAuthentify } from '@authentify/react';

function LoginComponent() {
  const { login, user, isLoading } = useAuthentify();

  const handleLogin = async (email, password) => {
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (user) {
    return <div>Welcome, {user.email}!</div>;
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      handleLogin(
        formData.get('email'),
        formData.get('password')
      );
    }}>
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
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
                <h1 className="text-xl font-bold text-gray-900">Authentify SDK</h1>
                <p className="text-xs text-gray-500">Developer Documentation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="border-2">
                  Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-gradient-primary">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-6 border border-white/20">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">Developer SDK</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Build with Authentify
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
            Integrate decentralized authentication into your dApp with our powerful SDK. 
            Get started in minutes with comprehensive documentation and examples.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
              <Download className="mr-2 h-5 w-5" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-lg text-lg px-8 py-6">
              <Book className="mr-2 h-5 w-5" />
              View Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Quick Start */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient">Quick Start</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get up and running with Authentify in less than 5 minutes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Installation */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Installation
                </CardTitle>
                <CardDescription>Install the Authentify SDK via npm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <button
                    onClick={() => copyToClipboard(installCode, 'install')}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedCode === 'install' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <code className="text-green-400 font-mono text-sm">
                    {installCode}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Basic Usage */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  Basic Usage
                </CardTitle>
                <CardDescription>Initialize and use the SDK</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 relative max-h-64 overflow-y-auto">
                  <button
                    onClick={() => copyToClipboard(quickStartCode, 'quickstart')}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    {copiedCode === 'quickstart' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <pre className="text-sm">
                    <code className="text-gray-300">
                      {quickStartCode}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient">SDK Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build secure authentication
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-hover border-2 border-transparent hover:border-blue-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg w-fit">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Client-side password hashing, JWT tokens, and secure session management out of the box.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 border-transparent hover:border-purple-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg w-fit">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">TypeScript Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Full TypeScript support with comprehensive type definitions and IntelliSense.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 border-transparent hover:border-green-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg w-fit">
                  <ExternalLink className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Blockchain Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Seamless Polkadot wallet integration and smart contract interaction.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 border-transparent hover:border-yellow-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-fit">
                  <Book className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">React Hooks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Ready-to-use React hooks for authentication state management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 border-transparent hover:border-red-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg w-fit">
                  <Download className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">OAuth Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built-in support for Google, GitHub, and Twitter OAuth providers.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-2 border-transparent hover:border-indigo-200">
              <CardHeader>
                <div className="mb-4 p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg w-fit">
                  <Shield className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built-in rate limiting and error handling for production applications.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* React Example */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient">React Integration</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Use our React hooks for seamless integration
            </p>
          </div>

          <Card className="shadow-lg border-2 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                React Hook Example
              </CardTitle>
              <CardDescription>Complete login component with error handling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <button
                  onClick={() => copyToClipboard(reactCode, 'react')}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedCode === 'react' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <pre className="text-sm overflow-x-auto">
                  <code className="text-gray-300">
                    {reactCode}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Reference */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient">API Reference</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete API documentation and examples
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>Core authentication functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">register(data)</h4>
                  <p className="text-sm text-gray-600">Register a new user with email and password</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">login(credentials)</h4>
                  <p className="text-sm text-gray-600">Authenticate user and return session tokens</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900">logout()</h4>
                  <p className="text-sm text-gray-600">End user session and clear tokens</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">refreshToken()</h4>
                  <p className="text-sm text-gray-600">Refresh expired access tokens</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle>Wallet Integration</CardTitle>
                <CardDescription>Polkadot wallet functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">connectWallet()</h4>
                  <p className="text-sm text-gray-600">Connect to Polkadot.js extension</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">getAccounts()</h4>
                  <p className="text-sm text-gray-600">Retrieve available wallet accounts</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-900">signMessage(message)</h4>
                  <p className="text-sm text-gray-600">Sign messages with wallet</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">getBalance(address)</h4>
                  <p className="text-sm text-gray-600">Get account balance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Get Started CTA */}
        <section className="text-center">
          <Card className="bg-gradient-primary text-white border-0 shadow-2xl overflow-hidden relative max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <CardContent className="p-12 relative z-10">
              <Code className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-4xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join developers building the future of decentralized authentication. 
                Get your API keys and start integrating today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
                    Get API Keys
                  </Button>
                </Link>
                <a href="https://github.com/yourusername/authentify" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-lg text-lg px-8 py-6">
                    View on GitHub
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-purple-400" />
              <span className="text-white font-bold">Authentify SDK</span>
            </div>
            <div className="flex gap-6 mb-4 md:mb-0">
              <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://docs.example.com" className="hover:text-white transition-colors">API Docs</a>
              <a href="https://discord.gg" className="hover:text-white transition-colors">Discord</a>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2024 Authentify. Built for developers.</p>
              <p className="text-sm mt-1">MIT License • Open Source</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}