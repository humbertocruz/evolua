import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Envware',
  description: 'Operational workflow for environments, secrets, approvals, and access.',
  applicationName: 'Envware',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Envware',
  },
  icons: {
    icon: ['/logo.png'],
    apple: ['/logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
   <html lang="en" className="dark">
    <Analytics />
      <body className={`${inter.className} min-h-screen bg-[#0a0c10] text-zinc-100 antialiased`}>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  )
}
