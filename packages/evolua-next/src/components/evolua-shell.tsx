"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/evolua", label: "Dashboard", description: "Visão geral" },
  { href: "/evolua/pages", label: "Pages", description: "Páginas do modelo" },
  { href: "/evolua/components", label: "Components", description: "Blocos reutilizáveis" },
  { href: "/evolua/datasources", label: "Datasources", description: "Conexões e dados" },
];

function isActive(pathname: string, href: string) {
  if (href === "/evolua") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EvoluaShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-6 lg:py-6">
        <aside className="flex flex-col rounded-[30px] border border-black/5 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-400">Evolu[a]</p>
            <h1 className="mt-3 text-[24px] font-semibold tracking-tight text-zinc-900">Control Center</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Leve, limpo e sem cosplay de nave da NASA. Do jeitinho que presta.
            </p>
          </div>

          <nav className="mt-4 flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-2xl px-4 py-3 transition",
                    active
                      ? "bg-zinc-100 text-zinc-900 shadow-sm ring-1 ring-black/5"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                  ].join(" ")}
                >
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={[
                    "mt-1 text-xs leading-5",
                    active ? "text-zinc-500" : "text-zinc-400",
                  ].join(" ")}>
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">Status</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Runtime vivo, cockpit arrumado e menos poluição visual. Amém.
            </p>
          </div>
        </aside>

        <main className="rounded-[34px] border border-black/5 bg-[#fcfcfb] shadow-[0_12px_40px_rgba(15,23,42,0.04)]">
          <div className="min-h-screen rounded-[34px] p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
