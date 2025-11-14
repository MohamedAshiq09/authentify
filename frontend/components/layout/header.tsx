'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <nav className="border-b border-border/50 bg-black backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Authentify Logo"
            width={150}
            height={150}
            className="rounded-lg"
          />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Products
          </a>
          <Link href="/sdk" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="btn-ghost hidden md:inline-flex">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="btn-primary">
              Start building for free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}