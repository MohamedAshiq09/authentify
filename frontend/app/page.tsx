'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wallet, Code, Lock, Zap, Users, Award, GitBranch } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Polkadot Theme */}
      <header className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-purple-600 blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-indigo-400 to-purple-600 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-10 w-10 drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold">Authentify</span>
              <div className="text-xs text-pink-200 font-medium">Polkadot Hackathon 2024</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-lg">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                Get Started →
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-20 text-center relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-6 border border-white/20">
            <Award className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Built for Polkadot Hackathon 2024</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Web3 Authentication<br />
            <span className="text-gradient-success">Built on Polkadot</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Decentralized identity authentication system with OAuth integration, JWT sessions, and ink! smart contract interaction on Polkadot.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Start Building
              </Button>
            </Link>
            <Link href="/sdk">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-lg text-lg px-8 py-6">
                <Code className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </Link>
            <a href="https://github.com/yourusername/authentify" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-lg text-lg px-8 py-6">
                <GitBranch className="mr-2 h-5 w-5" />
                GitHub Repo
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-sm text-purple-200">Open Source</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold mb-1">⚡</div>
              <div className="text-sm text-purple-200">Lightning Fast</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold mb-1">🔒</div>
              <div className="text-sm text-purple-200">Fully Secure</div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)" />
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 animate-slide-up">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gradient">Why Authentify?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Enterprise-grade authentication infrastructure for the Polkadot ecosystem</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover border-2 border-transparent hover:border-purple-200">
            <CardHeader>
              <div className="mb-4 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg w-fit">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Wallet Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Seamless connection with Polkadot.js extension. Support for multiple accounts and networks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-transparent hover:border-purple-200">
            <CardHeader>
              <div className="mb-4 p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg w-fit">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Smart Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                On-chain identity storage using ink! smart contracts on Polkadot blockchain.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-transparent hover:border-purple-200">
            <CardHeader>
              <div className="mb-4 p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg w-fit">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Secure Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                JWT-based authentication with auto-refresh, multi-device support, and session management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-transparent hover:border-purple-200">
            <CardHeader>
              <div className="mb-4 p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg w-fit">
                <Code className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Developer SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Easy integration for dApps with comprehensive API, documentation, and TypeScript support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built with Modern Tech</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">Production-ready stack for the Polkadot ecosystem</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-4xl mb-4">⚛️</div>
              <h3 className="text-xl font-bold mb-2">Frontend</h3>
              <p className="text-gray-300">Next.js 14, TypeScript, Tailwind CSS, Zustand</p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2">Blockchain</h3>
              <p className="text-gray-300">Polkadot, ink! Smart Contracts, Substrate</p>
            </div>
            <div className="text-center p-6 glass rounded-xl">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mb-2">Backend</h3>
              <p className="text-gray-300">Node.js, Express, PostgreSQL, JWT</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-primary text-white border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <CardContent className="p-12 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Award className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
              <h2 className="text-4xl font-bold mb-4">Polkadot Hackathon 2024 Project</h2>
              <p className="text-xl text-blue-100 mb-8">
                A complete authentication infrastructure showcasing the power of Polkadot's multi-chain ecosystem with ink! smart contracts and Web3 integration.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
                  <span className="font-semibold">🏆 Best Infrastructure</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
                  <span className="font-semibold">🔒 Security Focus</span>
                </div>
                <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full">
                  <span className="font-semibold">⚡ Production Ready</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join developers building the future of decentralized identity on Polkadot
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
                Create Account
              </Button>
            </Link>
            <Link href="/sdk">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-lg text-lg px-8 py-6">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-purple-400" />
              <span className="text-white font-bold">Authentify</span>
            </div>
            <div className="flex gap-6 mb-4 md:mb-0">
              <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://docs.example.com" className="hover:text-white transition-colors">Docs</a>
              <a href="https://polkadot.network" className="hover:text-white transition-colors">Polkadot</a>
            </div>
            <div className="text-center md:text-right">
              <p>&copy; 2024 Authentify. Built for Polkadot Hackathon.</p>
              <p className="text-sm mt-1">Open Source • MIT License</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}