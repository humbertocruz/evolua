import fs from 'node:fs';
import path from 'node:path';
function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}
export function materializeNextComponents(runtimeAppDir) {
    const componentsDir = path.join(runtimeAppDir, 'src', 'components', 'evolua');
    ensureDir(componentsDir);
    const files = {
        'PageShell.tsx': `import type { ReactNode } from 'react';

export function PageShell({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <main className={centered ? 'min-h-screen flex items-center justify-center px-6 py-12' : 'min-h-screen px-6 py-12'}>
      {children}
    </main>
  );
}
`,
        'AuthCard.tsx': `import type { ReactNode } from 'react';

export function AuthCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={['w-full rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl p-8 flex flex-col', className].filter(Boolean).join(' ')}>
      {children}
    </section>
  );
}
`,
        'TextField.tsx': `export function TextField({ label, type = 'text' }: { label: string; type?: 'text' | 'email' | 'password' }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-zinc-700">
      <span>{label}</span>
      <input type={type} placeholder={label} className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900" />
    </label>
  );
}
`,
        'Button.tsx': `import type { ReactNode } from 'react';

export function Button({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <button className={['h-11 rounded-xl font-semibold transition-colors hover:opacity-90', className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}
`,
        'LinkText.tsx': `import type { ReactNode } from 'react';

export function LinkText({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={['text-left transition-colors hover:opacity-80', className].filter(Boolean).join(' ')}>
      {children}
    </a>
  );
}
`,
    };
    for (const [fileName, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(componentsDir, fileName), content, 'utf8');
    }
}
