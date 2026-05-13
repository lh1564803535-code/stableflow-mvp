"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function CtaSection() {
  const { t } = useTranslations();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-16 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to build the on-chain economy?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of builders transacting with stablecoins. Start free, scale infinitely.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/browse">
                <Button size="lg" className="gap-2 px-8">
                  {t("cta_browse")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  <BookOpen className="h-4 w-4" />
                  {t("cta_sell")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
