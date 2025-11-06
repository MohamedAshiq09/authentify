// 'use client';

// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Shield, Wallet, Code, Lock, Zap, Users, Award, GitBranch, ArrowRight, Sparkles, Database, Terminal } from 'lucide-react';

// export default function HomePage() {
//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: 'hsl(240 10% 3.9%)', color: 'hsl(0 0% 98%)' }}>
//       {/* Hero Section */}
//       <header style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid hsl(240 5% 15% / 0.5)' }}>
//         {/* Animated Background */}
//         <div className="absolute inset-0 dots-pattern opacity-50"></div>
//         <div style={{ 
//           position: 'absolute', 
//           inset: '0', 
//           background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1), transparent)' 
//         }}></div>

//         {/* Navigation */}
//         <nav style={{ 
//           position: 'relative', 
//           maxWidth: '1200px', 
//           margin: '0 auto', 
//           padding: '1.5rem 1rem', 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center' 
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//             <div style={{ position: 'relative' }}>
//               <div style={{
//                 position: 'absolute',
//                 inset: '0',
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 borderRadius: '0.5rem',
//                 filter: 'blur(8px)',
//                 opacity: '0.5'
//               }}></div>
//               <div style={{
//                 position: 'relative',
//                 display: 'flex',
//                 height: '2.5rem',
//                 width: '2.5rem',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRadius: '0.5rem',
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))'
//               }}>
//                 <Shield className="h-6 w-6 text-white" />
//               </div>
//             </div>
//             <div>
//               <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Authentify</span>
//               <div style={{ fontSize: '0.75rem', color: 'hsl(240 5% 64.9%)', fontWeight: '500' }}>Polkadot Authentication</div>
//             </div>
//           </div>
//           <div style={{ display: 'flex', gap: '0.75rem' }}>
//             <Link href="/login">
//               <Button variant="ghost" style={{
//                 color: 'hsl(0 0% 98%)',
//                 fontWeight: '500',
//                 padding: '0.625rem 1.5rem',
//                 borderRadius: '0.5rem',
//                 transition: 'all 0.3s ease',
//                 backgroundColor: 'transparent',
//                 border: 'none'
//               }}>Login</Button>
//             </Link>
//             <Link href="/register">
//               <Button style={{
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 color: 'white',
//                 fontWeight: '500',
//                 padding: '0.625rem 1.5rem',
//                 borderRadius: '0.5rem',
//                 border: 'none',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem'
//               }}>
//                 Get Started
//                 <ArrowRight className="h-4 w-4" />
//               </Button>
//             </Link>
//           </div>
//         </nav>

//         {/* Hero Content */}
//         <div style={{ 
//           position: 'relative', 
//           maxWidth: '1200px', 
//           margin: '0 auto', 
//           padding: '5rem 1rem', 
//           textAlign: 'center' 
//         }}>
//           <div style={{
//             display: 'inline-flex',
//             alignItems: 'center',
//             gap: '0.5rem',
//             backgroundColor: 'rgba(255, 255, 255, 0.05)',
//             backdropFilter: 'blur(24px)',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             padding: '0.5rem 1rem',
//             borderRadius: '9999px',
//             marginBottom: '2rem'
//           }}>
//             <Sparkles className="h-4 w-4" style={{ color: 'rgb(244 114 182)' }} />
//             <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Built for Polkadot Hackathon 2024</span>
//           </div>

//           <h1 style={{ 
//             fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
//             fontWeight: 'bold', 
//             marginBottom: '1.5rem', 
//             lineHeight: '1.1', 
//             maxWidth: '80rem', 
//             margin: '0 auto 1.5rem auto' 
//           }}>
//             The developers'<br />
//             <span style={{
//               background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(168, 85, 247), rgb(99, 102, 241))',
//               WebkitBackgroundClip: 'text',
//               backgroundClip: 'text',
//               color: 'transparent'
//             }}>authentication platform</span>
//           </h1>

//           <p style={{ 
//             fontSize: 'clamp(1.125rem, 3vw, 1.5rem)', 
//             marginBottom: '3rem', 
//             color: 'hsl(240 5% 64.9%)', 
//             maxWidth: '48rem', 
//             margin: '0 auto 3rem auto', 
//             lineHeight: '1.6' 
//           }}>
//             Decentralized identity authentication system with OAuth integration, JWT sessions, and ink! smart contract interaction on Polkadot. Use built-in backend infrastructure and web hosting, all from a single place.
//           </p>

//           <div style={{ 
//             display: 'flex', 
//             flexWrap: 'wrap', 
//             gap: '1rem', 
//             justifyContent: 'center', 
//             marginBottom: '4rem' 
//           }}>
//             <Link href="/register">
//               <Button style={{
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 color: 'white',
//                 fontSize: '1.125rem',
//                 padding: '1.5rem 2rem',
//                 height: 'auto',
//                 borderRadius: '0.5rem',
//                 border: 'none',
//                 fontWeight: '500'
//               }}>
//                 Start building for free
//               </Button>
//             </Link>
//             <Link href="/sdk">
//               <Button style={{
//                 backgroundColor: 'hsl(240 5% 15%)',
//                 color: 'hsl(0 0% 98%)',
//                 fontSize: '1.125rem',
//                 padding: '1.5rem 2rem',
//                 height: 'auto',
//                 borderRadius: '0.5rem',
//                 border: '1px solid hsl(240 5% 15% / 0.5)',
//                 fontWeight: '500',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '0.5rem'
//               }}>
//                 <Code className="h-5 w-5" />
//                 Documentation
//               </Button>
//             </Link>
//           </div>

//           {/* Stats */}
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(3, 1fr)', 
//             gap: '2rem', 
//             maxWidth: '48rem', 
//             margin: '0 auto' 
//           }}>
//             <div style={{
//               backgroundColor: 'hsl(240 10% 6%)',
//               border: '1px solid hsl(240 5% 15% / 0.5)',
//               borderRadius: '0.75rem',
//               padding: '1.5rem',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//             }}>
//               <div style={{ 
//                 fontSize: '1.875rem', 
//                 fontWeight: 'bold', 
//                 marginBottom: '0.5rem',
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 WebkitBackgroundClip: 'text',
//                 backgroundClip: 'text',
//                 color: 'transparent'
//               }}>52K</div>
//               <div style={{ fontSize: '0.875rem', color: 'hsl(240 5% 64.9%)' }}>GitHub Stars</div>
//             </div>
//             <div style={{
//               backgroundColor: 'hsl(240 10% 6%)',
//               border: '1px solid hsl(240 5% 15% / 0.5)',
//               borderRadius: '0.75rem',
//               padding: '1.5rem',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//             }}>
//               <div style={{ 
//                 fontSize: '1.875rem', 
//                 fontWeight: 'bold', 
//                 marginBottom: '0.5rem',
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 WebkitBackgroundClip: 'text',
//                 backgroundClip: 'text',
//                 color: 'transparent'
//               }}>100%</div>
//               <div style={{ fontSize: '0.875rem', color: 'hsl(240 5% 64.9%)' }}>Open Source</div>
//             </div>
//             <div style={{
//               backgroundColor: 'hsl(240 10% 6%)',
//               border: '1px solid hsl(240 5% 15% / 0.5)',
//               borderRadius: '0.75rem',
//               padding: '1.5rem',
//               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
//             }}>
//               <div style={{ 
//                 fontSize: '1.875rem', 
//                 fontWeight: 'bold', 
//                 marginBottom: '0.5rem',
//                 background: 'linear-gradient(to right, rgb(236, 72, 153), rgb(244, 63, 94))',
//                 WebkitBackgroundClip: 'text',
//                 backgroundClip: 'text',
//                 color: 'transparent'
//               }}>⚡</div>
//               <div style={{ fontSize: '0.875rem', color: 'hsl(240 5% 64.9%)' }}>Lightning Fast</div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Simple Footer */}
//       <footer style={{ 
//         borderTop: '1px solid hsl(240 5% 15% / 0.5)', 
//         padding: '3rem 0' 
//       }}>
//         <div style={{ 
//           maxWidth: '1200px', 
//           margin: '0 auto', 
//           padding: '0 1rem' 
//         }}>
//           <div style={{ 
//             display: 'flex', 
//             flexDirection: 'column', 
//             alignItems: 'center', 
//             gap: '1rem' 
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//               <Shield className="h-6 w-6" style={{ color: 'rgb(244 114 182)' }} />
//               <span style={{ fontWeight: 'bold' }}>Authentify</span>
//             </div>
//             <p style={{ color: 'hsl(240 5% 64.9%)', textAlign: 'center' }}>
//               &copy; 2024 Authentify. Built for Polkadot Hackathon. Open Source • MIT License
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }





'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wallet, Code, Lock, Zap, Users, Award, GitBranch, ArrowRight, Sparkles, Database, Terminal } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border/50">
        {/* Animated Background */}
        <div className="absolute inset-0 dots-pattern opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-transparent"></div>

        {/* Navigation */}
        <nav className="relative container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-lg opacity-50"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold">Authentify</span>
              <div className="text-xs text-muted-foreground font-medium">Polkadot Authentication</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="btn-ghost">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span className="text-sm font-medium">Built for Polkadot Hackathon 2024</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-5xl mx-auto">
            The developers'<br />
            <span className="text-gradient">authentication platform</span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Decentralized identity authentication system with OAuth integration, JWT sessions, 
            and ink! smart contract interaction on Polkadot. Use built-in backend infrastructure 
            and web hosting, all from a single place.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="btn-primary text-lg px-8 py-6 h-auto">
                Start building for free
              </Button>
            </Link>
            <Link href="/sdk">
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-6 h-auto">
                <Code className="mr-2 h-5 w-5" />
                Documentation
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="card-dark p-6">
              <div className="text-3xl font-bold text-gradient-primary mb-2">52K</div>
              <div className="text-sm text-muted-foreground">GitHub Stars</div>
            </div>
            <div className="card-dark p-6">
              <div className="text-3xl font-bold text-gradient-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Open Source</div>
            </div>
            <div className="card-dark p-6">
              <div className="text-3xl font-bold text-gradient-primary mb-2">⚡</div>
              <div className="text-sm text-muted-foreground">Lightning Fast</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
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

      {/* Tech Stack Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
              <GitBranch className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium">Technology</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built with<br /><span className="text-gradient">modern tech stack</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Production-ready stack for the Polkadot ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="card-dark text-center p-8">
              <div className="text-5xl mb-6">⚛️</div>
              <h3 className="text-2xl font-bold mb-4">Frontend</h3>
              <p className="text-muted-foreground">Next.js 14, TypeScript, Tailwind CSS, Zustand</p>
            </Card>
            <Card className="card-dark text-center p-8">
              <div className="text-5xl mb-6">🔗</div>
              <h3 className="text-2xl font-bold mb-4">Blockchain</h3>
              <p className="text-muted-foreground">Polkadot, ink! Smart Contracts, Substrate</p>
            </Card>
            <Card className="card-dark text-center p-8">
              <div className="text-5xl mb-6">⚙️</div>
              <h3 className="text-2xl font-bold mb-4">Backend</h3>
              <p className="text-muted-foreground">Node.js, Express, PostgreSQL, JWT</p>
            </Card>
          </div>
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