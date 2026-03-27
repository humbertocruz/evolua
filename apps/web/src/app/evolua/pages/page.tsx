import { getAllPages } from "@/evolua/store";
import { PagesList } from "./pages-list";

export const dynamic = "force-dynamic";

export default async function EvoluaPagesIndexPage() {
  const pages = await getAllPages();
  return <PagesList pages={pages} />;
}
