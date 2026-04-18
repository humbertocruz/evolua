'use client'

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { CheckCircle, Terminal } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  // We can use sessionId to verify transaction if needed, but for now just show success.

  return (
    <div className="max-w-md w-full bg-base-200/50 p-8 rounded-3xl border border-base-300 shadow-xl backdrop-blur-sm animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-success/20">
        <CheckCircle size={40} strokeWidth={3} />
      </div>
      
      <h1 className="text-3xl font-black mb-4 tracking-tight">Payment Successful!</h1>
      <p className="text-lg text-base-content/70 mb-8 leading-relaxed">
        Your account has been successfully upgraded to <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Premium</span>.
      </p>

      <div className="mockup-code bg-neutral text-neutral-content text-left mb-8 shadow-lg border border-white/5 scale-95">
        <pre data-prefix="$"><code>envware status</code></pre>
        <pre className="text-success"><code>Plan: ✨ PREMIUM</code></pre>
        <pre className="text-base-content/50"><code>Limits: 100 projects</code></pre>
      </div>

      <p className="text-sm text-base-content/50 mb-8">
        You can now close this tab and return to your terminal to verify your status.
      </p>

      <div className="flex flex-col gap-3">
        <Link href="/docs" className="btn btn-primary btn-block shadow-lg shadow-primary/20">
          Read Documentation
        </Link>
        <Link href="/" className="btn btn-ghost btn-block">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-base-100 selection:bg-primary selection:text-primary-content flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
        {/* Background blobs for visual flair */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse delay-700" />

        <Suspense fallback={<div className="loading loading-spinner loading-lg text-primary"></div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="footer footer-center p-10 bg-base-100 text-base-content border-t border-base-300">
        <aside>
          <div className="relative w-24 h-24 overflow-hidden rounded-xl mb-4 opacity-50 mx-auto">
             <Image 
              src="/logo.png" 
              alt="envware logo" 
              fill 
              className="object-cover"
            />
          </div>
          <p className="font-bold text-xl">envware</p> 
          <p className="text-base-content/60">Built for developers, by developers.</p>
          <p>© 2026 envware. All rights reserved.</p>
        </aside>
      </footer>
    </div>
  );
}
