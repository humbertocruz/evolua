// Re-export from auth directory (fix for @/auth alias resolving to auth.ts instead of auth/index.ts)
export { handlers, signIn, signOut, auth } from "./auth/index";
