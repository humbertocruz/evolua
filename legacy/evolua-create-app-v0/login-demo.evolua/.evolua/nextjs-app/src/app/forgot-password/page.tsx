import type { Metadata } from 'next';
import { PageShell } from "../../components/evolua/PageShell";
import { AuthCard } from "../../components/evolua/AuthCard";
import { TextField } from "../../components/evolua/TextField";
import { Button } from "../../components/evolua/Button";
import { LinkText } from "../../components/evolua/LinkText";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Receba instruções para redefinir sua senha.",
};

export default function Page() {
  return (
    <>
      <div style={{ background: "#09090b", color: "#f4f4f5" }}>
        <PageShell centered={true}>
<AuthCard className="max-w-md gap-4">
<div className="text-3xl font-bold">Recuperar senha</div>
<div className="text-sm text-zinc-600">Insira seu e-mail para receber as instruções.</div>
<TextField label="E-mail" type="email" />
<Button className="h-11 rounded-xl font-semibold transition-colors hover:opacity-90 bg-[var(--primary)] text-[var(--primary-foreground)]">Enviar instruções</Button>
</AuthCard>
</PageShell>
      </div>
    </>
  );
}
