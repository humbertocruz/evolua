import type { ReactNode } from 'react';

export function LinkText({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={['text-left transition-colors hover:opacity-80', className].filter(Boolean).join(' ')}>
      {children}
    </a>
  );
}
