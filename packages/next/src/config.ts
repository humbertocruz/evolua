import type { EvoluaConfig } from "@evolua/types";

let config: EvoluaConfig | null = null;

export function initEvolua(newConfig: EvoluaConfig) {
  config = newConfig;
  if (config.debug) {
    console.log("[Evolua] Initialized with config:", {
      projectId: config.projectId,
      endpoint: config.endpoint,
    });
  }
}

export function getConfig(): EvoluaConfig | null {
  return config;
}
