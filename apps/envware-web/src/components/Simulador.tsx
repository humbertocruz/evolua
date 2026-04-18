'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, MessageSquare, Shield, Check, Send, User, UserCheck, GitBranch } from 'lucide-react';

export const Simulador = () => {
  const [step, setStep] = useState(0);
  const [ownerTerminal, setOwnerTerminal] = useState(['λ envw request my-team env-prod OWNER']);
  const [devTerminal, setDevTerminal] = useState<string[]>([]);
  const [messages, setMessages] = useState<{sender: 'owner' | 'dev', text: string, id: number}[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const scrollToEnd = () => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      
      const ownerContainer = document.getElementById('owner-terminal');
      if (ownerContainer) ownerContainer.scrollTop = ownerContainer.scrollHeight;
      
      const devContainer = document.getElementById('dev-terminal');
      if (devContainer) devContainer.scrollTop = devContainer.scrollHeight;
    };

    // Pequeno timeout para garantir que o DOM renderizou as novas mensagens
    const timeout = setTimeout(scrollToEnd, 100);
    return () => clearTimeout(timeout);
  }, [messages, ownerTerminal, devTerminal]);

  const steps = [
    {
      title: "1. Owner creates the project",
      action: async () => {
        setOwnerTerminal(prev => [...prev, '✓ Project created: env-prod 🌸', 'λ git envware push', '🔐 Encrypting initial secrets...', '🚀 Pushing to Git... Done!']);
        await delay(1000);
        addMessage('owner', 'Hey dev! Just uploaded the project. If you don\'t have the CLI yet: "curl -sSL https://www.envware.dev/install.sh | bash"');
        await delay(1500);
        addMessage('owner', 'Then run: "envw request-access my-team env-prod DEV"');
      }
    },
    {
      title: "2. Dev requests access",
      action: async () => {
        setDevTerminal(['λ envw request-access my-team env-prod DEV']);
        await delay(800);
        setDevTerminal(prev => [...prev, '🔐 Local Identity: SHA256:7uG/px...9k (Dev MacBook)', '✓ Request for role [DEV] sent successfully!', '⌛ Fingerprint abc123... pending owner approval.']);
        await delay(500);
        addMessage('dev', 'Done! Just sent the request as DEV. Can you check my fingerprint abc123...?');
      }
    },
    {
      title: "3. Owner approves and shares the Repo",
      action: async () => {
        setOwnerTerminal(prev => [...prev, 'λ envw requests approve 1', '✓ Access granted to dev@company.com! 🌸']);
        await delay(800);
        addMessage('owner', 'Approved! Grab the repo here: https://github.com/company/env-prod.git');
        await delay(1000);
        addMessage('owner', 'Use "git envware checkout", it clones and pulls the secrets in one go.');
      }
    },
    {
      title: "4. Dev performs Magic Checkout",
      action: async () => {
        setDevTerminal(prev => [...prev, 'λ git envware checkout https://github.com/company/env-prod.git', '🚀 Cloning repository...', '✓ Linked to env-prod 🌸', '🔐 Auto-decrypting .env.crypto...', '✓ .env created with 12 secrets! 💎']);
        await delay(1000);
        addMessage('dev', 'Whoa, it cloned and decrypted everything automatically! 🚀🌸');
      }
    },
    {
      title: "5. All Set",
      action: async () => {
        addMessage('owner', 'That\'s it! Welcome to the team. 🌸✨');
        await delay(500);
        addMessage('dev', 'Thanks! Let\'s build something great. 💻🔥');
      }
    }
  ];

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const addMessage = (sender: 'owner' | 'dev', text: string) => {
    setMessages(prev => [...prev, { sender, text, id: Date.now() }]);
  };

  const nextStep = async () => {
    if (step >= steps.length || isAnimating) return;
    setIsAnimating(true);
    await steps[step].action();
    setStep(prev => prev + 1);
    setIsAnimating(false);
  };

  const reset = () => {
    setStep(0);
    setOwnerTerminal(['λ envw request my-team env-prod OWNER']);
    setDevTerminal([]);
    setMessages([]);
  };

  return (
    <div className="w-full bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden text-white text-left font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4 border-b border-white/5 bg-white/5">
            <div>
                <h2 className="text-xl font-black text-white">Collaborative Workflow Simulation 🌸</h2>
                <p className="text-gray-400 text-xs">See how Owner and Dev work together without ever leaking a key.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={reset}
                    className="flex-1 md:flex-initial px-4 py-2 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                    Restart
                </button>
                <button 
                    onClick={nextStep}
                    disabled={isAnimating || step >= steps.length}
                    className="flex-1 md:flex-initial px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    style={{ backgroundColor: '#ff69b4' }}
                >
                    {isAnimating ? 'Processing...' : step === steps.length ? 'Flow Completed ✨' : 'Next Step ➔'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[700px] md:h-[750px]">
            {/* Terminal do Owner */}
            <div className="hidden md:flex lg:col-span-4 flex-col border-r border-white/5">
                <div className="flex items-center gap-2 p-4 bg-black/20 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <User size={12} className="text-primary" /> Owner Terminal
                </div>
                <div id="owner-terminal" className="flex-1 bg-black p-4 font-mono text-[11px] overflow-y-auto scroll-smooth">
                    {ownerTerminal.map((line, i) => (
                        <div key={i} className={`mb-1 leading-relaxed ${line.startsWith('λ') ? 'text-blue-400' : line.startsWith('✓') ? 'text-green-400' : line.startsWith('✓') || line.startsWith('🚀') || line.startsWith('🔐') ? 'text-green-400' : 'text-gray-400'}`}>
                            {line}
                        </div>
                    ))}
                    <div className="w-2 h-4 bg-blue-400 animate-pulse inline-block" />
                </div>
            </div>

            {/* WhatsApp Simulation */}
            <div className="lg:col-span-4 flex flex-col bg-[#0b141a] relative border-x border-white/5">
                <div className="bg-[#202c33] p-3 flex items-center gap-3 border-b border-white/5 z-10">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-lg shadow-inner">🌸</div>
                    <div>
                        <div className="text-white text-xs font-bold">Dev Team Sync</div>
                        <div className="text-[#8696a0] text-[9px] flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            online
                        </div>
                    </div>
                </div>
                    <div id="chat-messages" className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat scroll-smooth">
                        {messages.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 opacity-20 select-none">
                                <MessageSquare size={32} className="mb-2" />
                                <p className="text-[10px]">Collaboration messages <br/>will appear here</p>
                            </div>
                        )}
                        {messages.map((m) => (
                            <div 
                                key={m.id} 
                                className={`max-w-[90%] p-2 rounded-xl text-[11px] shadow-xl relative ${
                                    m.sender === 'owner' 
                                    ? 'bg-[#005c4b] text-white self-start rounded-tl-none border border-white/5' 
                                    : 'bg-[#202c33] text-white self-end rounded-tr-none border border-white/5'
                                }`}
                            >
                                <div className="text-[8px] opacity-60 mb-0.5 font-black uppercase tracking-tighter">
                                    {m.sender === 'owner' ? 'Owner (Humberto)' : 'Frontend Dev'}
                                </div>
                                <div className="leading-snug">{m.text}</div>
                                <div className="text-[8px] text-right opacity-40 mt-0.5">09:28</div>
                            </div>
                        ))}
                        <div className="h-8 flex-shrink-0" />
                    </div>
                <div className="bg-[#202c33] p-3 flex items-center gap-2">
                    <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-gray-400 text-[10px] border border-white/5">
                        System messages...
                    </div>
                    <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-lg">
                        <Send size={14} />
                    </div>
                </div>
            </div>

            {/* Terminal do Dev */}
            <div className="lg:col-span-4 flex flex-col border-l border-white/5">
                <div className="flex items-center gap-2 p-4 bg-black/20 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <UserCheck size={12} className="text-green-500" /> Dev Terminal
                </div>
                <div id="dev-terminal" className="flex-1 bg-black p-4 font-mono text-[11px] overflow-y-auto scroll-smooth">
                    {devTerminal.length === 0 && (
                        <div className="text-gray-800 italic select-none text-[10px]">Waiting for step...</div>
                    )}
                    {devTerminal.map((line, i) => (
                        <div key={i} className={`mb-1 leading-relaxed ${line.startsWith('λ') ? 'text-green-400' : line.startsWith('✓') || line.startsWith('🚀') || line.startsWith('🔐') ? 'text-green-400' : 'text-gray-400'}`}>
                            {line}
                        </div>
                    ))}
                    {devTerminal.length > 0 && <div className="w-2 h-4 bg-green-400 animate-pulse inline-block" />}
                </div>
            </div>
        </div>
    </div>
  );
};
