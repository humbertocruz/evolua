"use client";

import { createContext, useContext, type ReactNode } from "react";
import { initEvolua, type EvoluaConfig } from "../config";

interface EvoluaContextValue {
  config: EvoluaConfig;
}

const EvoluaContext = createContext<EvoluaContextValue | null>(null);

export function EvoluProvider({
  config,
  children,
}: {
  config: EvoluaConfig;
  children: ReactNode;
}) {
  initEvolua(config);

  return (
    <EvoluaContext.Provider value={{ config }}>
      {children}
    </EvoluaContext.Provider>
  );
}

export function useEvolua(): EvoluaContextValue {
  const ctx = useContext(EvoluaContext);
  if (!ctx) throw new Error("useEvolua must be used inside <EvoluProvider>");
  return ctx;
}
