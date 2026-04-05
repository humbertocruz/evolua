// @evolua/next — Runtime leve para Next.js conectar no Evolu[a] Cloud

export type { EvoluaConfig } from "@evolua/types";
export { initEvolua, getConfig } from "./config";
export { fetchProjectPages, fetchPage } from "./client";
export { renderPage, type PageData } from "./renderer.tsx";
