import type { ReactNode } from "react";

import { EvoluaShell } from "@/components/evolua-shell";

export default function EvoluaLayout({ children }: { children: ReactNode }) {
  return <EvoluaShell>{children}</EvoluaShell>;
}
