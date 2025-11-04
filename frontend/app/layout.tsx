import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Authentify - Polkadot Authentication',
  description: 'Decentralized identity authentication system built on Polkadot',
  keywords: ['authentication', 'polkadot', 'blockchain', 'web3', 'identity'],
  authors: [{ name: 'Authentify Team' }],
  openGraph: {
    title: 'Authentify - Polkadot Authentication',
    description: 'Decentralized identity authentication system built on Polkadot',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}