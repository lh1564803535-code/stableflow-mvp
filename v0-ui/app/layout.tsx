import type { Metadata } from "next";
import { WalletProvider } from "@/components/wallet-provider";
import { AppNavigation } from "@/components/app-navigation";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "StableFlow - Stablecoin Service Marketplace",
  description: "A decentralized marketplace for stablecoin-powered services. Escrow-secured, on-chain verified, built on Base.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0A] text-white">
        <WalletProvider>
          <AppNavigation />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
