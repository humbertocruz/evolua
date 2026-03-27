import type { EvoluaConfig } from "./types";
import { getConfig } from "./config";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Evolua not initialized. Call initEvolua() first.");

  const url = `${cfg.endpoint}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(cfg.apiKey ? { "x-api-key": cfg.apiKey } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Evolua API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── API Calls ─────────────────────────────────────────────

export async function fetchProjectPages(): Promise<{
  project: { id: string; slug: string; name: string };
  pages: Array<{ id: string; path: string; title: string }>;
}> {
  return request("/api/runtime/pages");
}

export async function fetchPage(path: string): Promise<{
  project: { id: string; slug: string; name: string };
  page: { id: string; path: string; title: string; nodes: unknown; visual?: unknown };
}> {
  return request(`/api/runtime/project?path=${encodeURIComponent(path)}`);
}
