import type {
  EvoluaConfig,
  EvoluaPageResponse,
  EvoluaProjectResponse,
  ProjectionKind,
} from "@evolua/types";
import { getConfig } from "./config";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cfg = getConfig();
  if (!cfg) throw new Error("Evolua not initialized. Call initEvolua() first.");

  const url = `${cfg.endpoint}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Evolua API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── API Calls ─────────────────────────────────────────────

export async function fetchProject(projectId: string): Promise<EvoluaProjectResponse> {
  return request<EvoluaProjectResponse>(`/projects/${projectId}`);
}

export async function fetchPage(
  projectId: string,
  route: string
): Promise<EvoluaPageResponse> {
  return request<EvoluaPageResponse>(
    `/projects/${projectId}/pages?route=${encodeURIComponent(route)}`
  );
}

export async function fetchProjection(
  projectId: string,
  projection: ProjectionKind
): Promise<any> {
  return request(`/projects/${projectId}/projections/${projection}`);
}
