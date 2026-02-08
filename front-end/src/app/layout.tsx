import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Kita pake font Inter biar clean
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "@/components/providers"; // File yang lo buat tadi

import { Toaster } from "@/components/ui/sonner"; // Buat notifikasi popup (Shadcn)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VERTEX | Mathematical Floor Protocol",
  description: "The first bonding curve protocol on Arbitrum with a rising floor price.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}