import "@evolua/ui/src/index";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolua Project",
  description: "Built with Evolua",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
