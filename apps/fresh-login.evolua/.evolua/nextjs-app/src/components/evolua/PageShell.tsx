import type { ReactNode } from 'react';

export function PageShell({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <main className={centered ? 'min-h-screen flex items-center justify-center px-6 py-12' : 'min-h-screen px-6 py-12'}>
      {children}
    </main>
  );
}
