import type { ReactNode } from 'react';

export function AuthCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={['w-full rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl p-8 flex flex-col', className].filter(Boolean).join(' ')}>
      {children}
    </section>
  );
}
