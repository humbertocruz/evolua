'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Simulador } from '@/components/Simulador';

export default function SimuladorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
                <span>Voltar para Home</span>
            </Link>
            <div className="text-right">
                <h1 className="text-2xl font-black tracking-tighter">.envware <span className="text-primary">Sim</span></h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Interactive Prototype v1.0</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
            <Simulador />

            {/* Footer Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold mb-1 text-sm">Criptografia Local (E2EE)</h4>
                        <p className="text-xs text-gray-500">Os segredos são criptografados na sua máquina antes de irem para o Git.</p>
                    </div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8m0 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V7" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold mb-1 text-sm">Native Git Sync</h4>
                        <p className="text-xs text-gray-500">Sincronize código e segredos com um único comando nativo.</p>
                    </div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold mb-1 text-sm">Aprovação Segura</h4>
                        <p className="text-xs text-gray-500">Owner tem controle total sobre quem acessa cada ambiente.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
