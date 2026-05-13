"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";
import { CATEGORIES, SEEDED_SERVICES, shortAddress } from "@/lib/contracts";

export default function BrowsePage() {
  const { t } = useTranslations();
  const [category, setCategory] = useState("all");

  const filtered = category === "all"
    ? SEEDED_SERVICES
    : SEEDED_SERVICES.filter((s) => s.category === category);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("browse_title")}</h1>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {t("filter_all")}
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                category === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Service grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t("no_services")}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => {
              const cat = CATEGORIES[service.category] || CATEGORIES.other;
              return (
                <Link key={service.id} href={`/browse/${service.id}`}>
                  <div className="group rounded-xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card">
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <span className="text-lg font-bold text-primary">{service.priceUSDC} USDC</span>
                    </div>
                    <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{cat.icon} {cat.label}</span>
                      <span>·</span>
                      <span className="font-mono">{shortAddress(service.sellerAddress)}</span>
                      <span>·</span>
                      <span>{service.orderCount} {t("orders_count")}</span>
                    </div>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.milestones.slice(0, 3).map((m) => (
                        <span key={m.name} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
