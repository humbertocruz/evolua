import type { Metadata } from 'next';
import { PageShell } from "../components/evolua/PageShell";
import { AuthCard } from "../components/evolua/AuthCard";
import { TextField } from "../components/evolua/TextField";
import { Button } from "../components/evolua/Button";
import { LinkText } from "../components/evolua/LinkText";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no app Evolu[a].",
};

export default function Page() {
  return (
    <>
      <div style={{ background: "#09090b", color: "#f4f4f5" }}>
        <PageShell centered={true}>
<AuthCard className="max-w-md gap-4">
<div className="text-3xl font-bold">Entrar</div>
<TextField label="E-mail" type="email" />
<TextField label="Senha" type="password" />
<Button className="h-11 rounded-xl font-semibold transition-colors hover:opacity-90 bg-[var(--primary)] text-[var(--primary-foreground)]">Entrar</Button>
<LinkText href="/forgot-password" className="text-left transition-colors hover:opacity-80 text-blue-500 underline underline-offset-4">Esqueci senha</LinkText>
</AuthCard>
</PageShell>
      </div>
    </>
  );
}
