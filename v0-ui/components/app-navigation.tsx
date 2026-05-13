"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ListOrdered, Plus, Store } from "lucide-react";

const navItems = [
  { name: "Browse", href: "/browse", icon: Store },
  { name: "Orders", href: "/orders", icon: ListOrdered },
  { name: "Create", href: "/create", icon: Plus },
];

export function AppNavigation() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/orders" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">StableFlow</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Wallet */}
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>
    </header>
  );
}
