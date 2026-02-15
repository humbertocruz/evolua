import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });
export const metadata = { title: "Genesis Movie App", description: "A futuristic movie dashboard powered by Genesis AI." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (<html lang="en"><body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>{children}</body></html>);
}
