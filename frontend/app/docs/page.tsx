"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Code,
  Book,
  Download,
  ExternalLink,
  Copy,
  CheckCircle2,
  Menu,
  X,
  Zap,
  Lock,
  Globe,
  Wallet,
  Fingerprint,
  Github,
  Package,
  Terminal,
  AlertTriangle,
  CheckCircle,
  Users,
  Database,
  Key,
  Layers,
  ArrowRight,
  Star,
  Lightbulb,
  Target,
  Wrench,
} from "lucide-react";
import { useState } from "react";

export default function SDKPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "install" | "quickstart" | "react" | "blockchain"
  >("install");

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const installCode = `npm install authentify-sdk`;

  const quickStartCode = `import { AuthentifySDK } from 'authentify-sdk';

const sdk = new AuthentifySDK({
  apiUrl: 'https://api.authentify.com',
  apiKey: 'your-api-key'
});

await sdk.initialize();

// Register user
const user = await sdk.register({
  username: 'johndoe',
  password: 'secure123',
  email: 'john@example.com'
});

// Login
const session = await sdk.login('johndoe', 'secure123');
console.log('Session:', session);`;

  const blockchainCode = `import { AuthentifySDK } from 'authentify-sdk';

const sdk = new AuthentifySDK({
  apiUrl: 'https://api.authentify.com',
  apiKey: 'your-api-key',
  wsUrl: 'ws://localhost:9944',
  contractAddress: 'YOUR CONTRACT ADDRESS',
  useContract: true
});

await sdk.initialize();

// Register on blockchain
const identity = await sdk.registerOnChain({
  username: 'blockchaindev',
  password: 'secure123'
});

// Authenticate via contract
const auth = await sdk.authenticateOnChain(
  'blockchaindev',
  'secure123'
);`;

  const reactCode = `import { AuthentifySDK } from 'authentify-sdk';
import { useState, useEffect } from 'react';

export function LoginForm() {
  const [sdk] = useState(() => 
    new AuthentifySDK({
      apiUrl: 'https://api.authentify.com',
      apiKey: process.env.NEXT_PUBLIC_API_KEY
    })
  );
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { sdk.initialize(); }, []);

  const handleLogin = async (username, password) => {
    setIsLoading(true);
    try {
      await sdk.login(username, password);
      setUser({ username });
    } finally {
      setIsLoading(false);
    }
  };

  return user ? (
    <p>Welcome, {user.username}! ✓</p>
  ) : (
    <button onClick={() => handleLogin('user', 'pass')} 
            disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  );
}`;

  const sections = [
    { id: "overview", label: "Overview", icon: Book },
    { id: "quickstart", label: "Quick Start", icon: Zap },
    { id: "installation", label: "Installation", icon: Package },
    { id: "api", label: "API Reference", icon: Globe },
    { id: "examples", label: "Code Examples", icon: Code },
    { id: "features", label: "Key Features", icon: Star },
    { id: "problem-solution", label: "Problem & Solution", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 text-slate-100">
      {/* Header - Dark Theme with Pink Accent */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg blur opacity-75"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-red-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                  Authentify SDK
                </h1>
                <p className="text-xs text-slate-400">
                  Developer Documentation
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex gap-0">
        {/* Sidebar Navigation - Fixed Professional Style */}
        <aside
          className={`fixed md:sticky top-[64px] left-0 h-[calc(100vh-64px)] w-64 overflow-y-auto border-r border-slate-800 bg-slate-950 transition-transform duration-300 z-40 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Documentation
              </p>
            </div>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(section.id);
                    element?.scrollIntoView({ behavior: "smooth" });
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                >
                  <Icon size={16} />
                  <span>{section.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 px-4 md:px-6 py-6 w-full">
          {/* Overview Section */}
          <section id="overview" className="mb-12 scroll-mt-20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-slate-100">
                Authentify SDK Documentation
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
                A comprehensive TypeScript SDK for integrating Web3 authentication into your applications. 
                Seamlessly connect traditional OAuth providers with blockchain identity management.
              </p>
            </div>

            {/* Hero Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/30">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-100">1.0.2</p>
                  <p className="text-xs text-slate-400">Latest Version</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30">
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-100">10K+</p>
                  <p className="text-xs text-slate-400">Downloads</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-100">100%</p>
                  <p className="text-xs text-slate-400">Type Safe</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-100">MIT</p>
                  <p className="text-xs text-slate-400">Open Source</p>
                </CardContent>
              </Card>
            </div>

            {/* What is Authentify */}
            <Card className="bg-slate-900/50 border-slate-800/50 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-100">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  What is Authentify?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Authentify is a revolutionary Web3 authentication platform that bridges the gap between traditional 
                  web authentication and blockchain identity management. It provides developers with a simple SDK to 
                  integrate decentralized authentication into their applications without the complexity of managing 
                  wallets, gas fees, or blockchain interactions.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-pink-500/20 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-1">Secure by Design</h4>
                      <p className="text-sm text-slate-400">End-to-end encryption with blockchain-backed identity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-1">Developer Friendly</h4>
                      <p className="text-sm text-slate-400">Simple API with comprehensive TypeScript support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 mb-1">Universal Integration</h4>
                      <p className="text-sm text-slate-400">Works with any web framework or mobile app</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Installation Section */}
          <section id="installation" className="mb-12 scroll-mt-20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-100">
                Installation
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Get started with Authentify SDK in seconds
              </p>
            </div>

            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-300">
                  <Package className="h-5 w-5 text-pink-500" />
                  Package Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">npm</p>
                    <div className="relative bg-slate-950/50 rounded-lg">
                      <button
                        onClick={() => copyToClipboard("npm install authentify-sdk", "npm")}
                        className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        {copiedCode === "npm" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      <pre className="p-3 text-sm text-slate-300 font-mono">
                        npm install authentify-sdk
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">yarn</p>
                    <div className="relative bg-slate-950/50 rounded-lg">
                      <button
                        onClick={() => copyToClipboard("yarn add authentify-sdk", "yarn")}
                        className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        {copiedCode === "yarn" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      <pre className="p-3 text-sm text-slate-300 font-mono">
                        yarn add authentify-sdk
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">pnpm</p>
                    <div className="relative bg-slate-950/50 rounded-lg">
                      <button
                        onClick={() => copyToClipboard("pnpm add authentify-sdk", "pnpm")}
                        className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        {copiedCode === "pnpm" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      <pre className="p-3 text-sm text-slate-300 font-mono">
                        pnpm add authentify-sdk
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Quick Start Section */}
          <section id="quickstart" className="mb-12 scroll-mt-20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-100">
                Quick Start Guide
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl">
                Get up and running in minutes
              </p>
            </div>

            {/* Code Tabs */}
            <Card className="bg-slate-900/50 border-slate-800/50 overflow-hidden">
              <CardHeader className="pb-0 border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-pink-300">
                    <Terminal className="h-5 w-5 text-pink-500" />
                    Code Examples
                  </CardTitle>
                  <div className="flex gap-2">
                    {[
                      { id: "install", label: "Install", icon: Package },
                      { id: "quickstart", label: "Basic", icon: Zap },
                      { id: "blockchain", label: "Blockchain", icon: Wallet },
                      { id: "react", label: "React", icon: Code },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-1 px-4 py-2 rounded-t-lg border-b-2 transition-all ${
                            activeTab === tab.id
                              ? "bg-slate-800/50 border-pink-500 text-pink-300"
                              : "border-transparent text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          <TabIcon size={16} />
                          <span className="text-sm font-medium">
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-slate-950/50">
                  <button
                    onClick={() => {
                      const codeMap: Record<string, string> = {
                        install: installCode,
                        quickstart: quickStartCode,
                        blockchain: blockchainCode,
                        react: reactCode,
                      };
                      copyToClipboard(codeMap[activeTab], activeTab);
                    }}
                    className="absolute top-3 right-3 p-2 hover:bg-slate-700 rounded transition-colors z-10"
                  >
                    {copiedCode === activeTab ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                  <pre className="p-6 overflow-x-auto">
                    <code className="text-sm text-slate-300 font-mono">
                      {activeTab === "install" && installCode}
                      {activeTab === "quickstart" && quickStartCode}
                      {activeTab === "blockchain" && blockchainCode}
                      {activeTab === "react" && reactCode}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Package Info Card */}
            <Card className="mt-6 bg-gradient-to-r from-pink-500/10 to-red-500/10 border-pink-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-300">
                  <Package className="h-5 w-5" />
                  npm Package Published
                </CardTitle>
                <CardDescription className="text-slate-300">
                  authentify-sdk is available on npm registry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Package Name</p>
                    <p className="font-semibold text-slate-100">authentify-sdk</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Version</p>
                    <p className="font-semibold text-slate-100">1.0.0</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">License</p>
                    <p className="font-semibold text-slate-100">MIT</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300">
                  The Authentify SDK is fully published and production-ready. Install it in your project with <code className="bg-slate-800 px-2 py-1 rounded text-pink-400 text-xs">npm install authentify-sdk</code> and start building Web3 authentication today.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.npmjs.com/package/authentify-sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                      <Package className="h-4 w-4 mr-2" />
                      View on npm
                    </Button>
                  </a>
                  <a
                    href="https://github.com/MohamedAshiq09/authentify"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-slate-700">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub Repository
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* API Reference Section */}
          <section id="api" className="mb-12 scroll-mt-20">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-slate-100">
                API Reference
              </h2>
              <p className="text-sm text-slate-400">
                All SDK methods and functions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Authentication Methods Card */}
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">
                    Authentication Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "initialize()",
                      desc: "Initialize SDK connection",
                    },
                    {
                      name: "register(data)",
                      desc: "Register a new user",
                    },
                    {
                      name: "login(username, password)",
                      desc: "Authenticate user",
                    },
                    {
                      name: "logout()",
                      desc: "End user session",
                    },
                    {
                      name: "isLoggedIn()",
                      desc: "Check auth status",
                    },
                    {
                      name: "getCurrentUser()",
                      desc: "Get user profile",
                    },
                  ].map((method, i) => (
                    <div key={i} className="border-l-2 border-pink-500/50 pl-3">
                      <h4 className="text-sm font-semibold text-slate-200">
                        {method.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {method.desc}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Blockchain Methods Card */}
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-100">
                    Blockchain Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "registerOnChain(data)",
                      desc: "Register on blockchain",
                    },
                    {
                      name: "authenticateOnChain(username, password)",
                      desc: "Authenticate via contract",
                    },
                    {
                      name: "createSession(accountId, duration)",
                      desc: "Create on-chain session",
                    },
                    {
                      name: "verifySession(sessionId)",
                      desc: "Verify session",
                    },
                    {
                      name: "isUsernameAvailable(username)",
                      desc: "Check username",
                    },
                    {
                      name: "changePassword(old, new)",
                      desc: "Change password",
                    },
                  ].map((method, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-emerald-500/50 pl-3"
                    >
                      <h4 className="text-sm font-semibold text-slate-200">
                        {method.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {method.desc}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
          {/* CTA Section */}
          <section className="mb-12 pt-6 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  Ready to get started?
                </h3>
                <p className="text-sm text-slate-400">
                  Start building with Authentify SDK
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/register">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                    Get API Keys
                  </Button>
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-slate-700">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer - Dark Theme */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-pink-500" />
                <span className="font-bold text-slate-100">Authentify SDK</span>
              </div>
              <p className="text-slate-500 text-sm">
                Decentralized authentication for Web3
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="font-semibold text-slate-100 text-sm mb-3">
                  Resources
                </h4>
                <ul className="space-y-1 text-slate-400 text-xs">
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      API Reference
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      Examples
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm mb-3">
                  Community
                </h4>
                <ul className="space-y-1 text-slate-400 text-xs">
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      Discord
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-pink-400">
                      Twitter
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-xs">
            <p>&copy; 2024 Authentify. MIT License • Open Source</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
