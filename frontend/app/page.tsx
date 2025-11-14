'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wallet, Code, Lock, Zap, Users, Award, ArrowRight, Database, Terminal, Activity } from 'lucide-react';
import Header from '@/components/layout/header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dots-pattern opacity-30"></div>
        
        <div className="container mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-73px)]">
            {/* Left Side - Content */}
            <div className="py-12 lg:py-0">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                The developers'<br />
                <span className="text-gradient">authentication<br />platform</span>
              </h1>

              <p className="text-lg lg:text-xl mb-8 text-muted-foreground leading-relaxed max-w-xl">
                Decentralized identity authentication with OAuth, JWT sessions, and ink! smart contracts on Polkadot.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="btn-primary text-base px-6 py-5 h-auto">
                    Start building for free
                  </Button>
                </Link>
                <Link href="/sdk">
                  <Button size="lg" variant="outline" className="btn-secondary text-base px-6 py-5 h-auto">
                    <Code className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Terminal/Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              
              {/* Main Terminal Card */}
              <Card className="card-dark relative overflow-hidden border-border/30">
                {/* Terminal Header */}
                <div className="border-b border-border/30 px-4 py-3 flex items-center justify-between bg-card/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-pink-400" />
                    <span className="text-sm font-medium">Authentify / Acme Corp / First Authentify project</span>
                  </div>
                </div>

                {/* Sidebar + Content */}
                <div className="flex h-[500px]">
                  {/* Sidebar */}
                  <div className="w-48 border-r border-border/30 bg-card/30 p-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Build</div>
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-secondary/50 text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors">
                        <Activity className="h-4 w-4" />
                        Overview
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:bg-secondary/30 transition-colors">
                        <Shield className="h-4 w-4" />
                        Auth
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:bg-secondary/30 transition-colors">
                        <Database className="h-4 w-4" />
                        Databases
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:bg-secondary/30 transition-colors">
                        <Zap className="h-4 w-4" />
                        Functions
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:bg-secondary/30 transition-colors">
                        <Database className="h-4 w-4" />
                        Storage
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 text-muted-foreground hover:bg-secondary/30 transition-colors">
                        <Users className="h-4 w-4" />
                        Messaging
                      </button>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-6 overflow-hidden">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-1">Authentify Project</h3>
                      <div className="inline-flex items-center gap-2 px-2 py-1 bg-secondary/50 rounded text-xs">
                        <span className="text-muted-foreground">Project ID</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Bandwidth</div>
                        <div className="text-2xl font-bold">1.19 <span className="text-sm text-muted-foreground">GB</span></div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Requests</div>
                        <div className="text-2xl font-bold">2K</div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="h-32 flex items-end gap-1 mb-6">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-pink-500/80 to-pink-500/40 rounded-t"
                          style={{
                            height: `${Math.random() * 100}%`,
                            opacity: 0.5 + Math.random() * 0.5,
                          }}
                        />
                      ))}
                    </div>

                    {/* Bottom Stats */}
                    <div className="grid grid-cols-2 gap-4 opacity-70">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground mb-1">DATABASES</div>
                        <div className="text-lg font-bold">4</div>
                        <div className="text-xs text-muted-foreground">Databases</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground mb-1">STORAGE</div>
                        <div className="text-lg font-bold">8.0 <span className="text-xs">MB</span></div>
                        <div className="text-xs text-muted-foreground">Storage</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24" id="products">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
            <Terminal className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium">Products</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            All-in-one authentication<br />for the{' '}
            <span className="text-gradient">Polkadot ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build secure, scalable authentication for Web3 applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-blue-500/10 rounded-xl w-fit border border-blue-500/20">
                <Wallet className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Wallet Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Seamless connection with Polkadot.js extension. Support for multiple accounts and networks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-purple-500/10 rounded-xl w-fit border border-purple-500/20">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Smart Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                On-chain identity storage using ink! smart contracts on Polkadot blockchain.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-green-500/10 rounded-xl w-fit border border-green-500/20">
                <Lock className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl">Secure Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                JWT-based authentication with auto-refresh, multi-device support, and session management.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-orange-500/10 rounded-xl w-fit border border-orange-500/20">
                <Code className="h-8 w-8 text-orange-400" />
              </div>
              <CardTitle className="text-2xl">Developer SDK</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Easy integration for dApps with comprehensive API, documentation, and TypeScript support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-pink-500/10 rounded-xl w-fit border border-pink-500/20">
                <Database className="h-8 w-8 text-pink-400" />
              </div>
              <CardTitle className="text-2xl">OAuth Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Built-in support for Google, GitHub, and Twitter OAuth providers for easier onboarding.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-dark card-hover card-glow">
            <CardHeader>
              <div className="mb-4 p-3 bg-yellow-500/10 rounded-xl w-fit border border-yellow-500/20">
                <Zap className="h-8 w-8 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-muted-foreground">
                Optimized performance with built-in rate limiting and caching for production apps.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>



      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="card-dark overflow-hidden relative border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <CardContent className="p-16 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Award className="h-20 w-20 mx-auto mb-8 text-pink-400" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="text-gradient">build the future</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Join developers building the future of decentralized identity on Polkadot. 
                Get started for free today.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="btn-primary text-lg px-8 py-6 h-auto">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sdk">
                  <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-6 h-auto">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-pink-400" />
              <span className="font-bold">Authentify</span>
            </div>
            <div className="flex gap-6 mb-4 md:mb-0">
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                GitHub
              </a>
              <a href="https://docs.example.com" className="text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </a>
              <a href="https://polkadot.network" className="text-muted-foreground hover:text-foreground transition-colors">
                Polkadot
              </a>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground">&copy; 2024 Authentify. Built for Polkadot Hackathon.</p>
              <p className="text-sm text-muted-foreground mt-1">Open Source • MIT License</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}