"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Globe } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

const navLinks = [
  { nameKey: "nav_browse" as const, href: "/browse" },
  { nameKey: "nav_sell" as const, href: "/create" },
  { nameKey: "nav_orders" as const, href: "/orders" },
  { nameKey: "nav_sales" as const, href: "/sales" },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useTranslations();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            StableFlow
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.nameKey)}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            className="flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-3 w-3" />
            {lang === "en" ? "中文" : "EN"}
          </button>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t(link.nameKey)}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => { setLang(lang === "en" ? "zh" : "en"); setMobileOpen(false); }}
                className="flex items-center justify-center gap-1 rounded-md border border-border/50 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                {lang === "en" ? "中文" : "EN"}
              </button>
              <div className="flex justify-center">
                <ConnectButton chainStatus="none" showBalance={false} accountStatus="address" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
