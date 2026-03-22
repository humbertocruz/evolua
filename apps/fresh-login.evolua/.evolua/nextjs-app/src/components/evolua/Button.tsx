import type { ReactNode } from 'react';

export function Button({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <button className={['h-11 rounded-xl font-semibold transition-colors hover:opacity-90', className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}
