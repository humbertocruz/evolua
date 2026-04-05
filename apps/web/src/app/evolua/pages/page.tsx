import { redirect } from "next/navigation";

// Legacy route — pages are now scoped to a project
// Users should go through /evolua → select project → pages
export default function LegacyPagesRedirect() {
  redirect("/evolua");
}
