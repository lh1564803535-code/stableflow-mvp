"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useTranslations } from "@/lib/i18n";

const DEMO_SALES = [
  {
    id: "ord_demo_002",
    serviceTitle: "Landing Page Development",
    totalAmount: 1200,
    buyerAddress: "0x1Cb90000000000000000000000000000007d77",
    milestones: [
      { index: 0, name: "Design Review", percent: 20, status: "released" },
      { index: 1, name: "Development", percent: 50, status: "funded" },
      { index: 2, name: "Deployment", percent: 30, status: "funded" },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  funded: "bg-yellow-500/20 text-yellow-400",
  delivered: "bg-blue-500/20 text-blue-400",
  released: "bg-green-500/20 text-green-400",
  disputed: "bg-red-500/20 text-red-400",
};

export default function SalesPage() {
  const { t } = useTranslations();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">{t("sales_label")}</h1>
          <p className="mb-6 text-muted-foreground">{t("connect_wallet_sales")}</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">{t("sales_label")} — {t("as_seller")}</h1>

        {DEMO_SALES.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">{t("no_sales")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("no_sales_desc")}</p>
            <Link href="/create" className="mt-4 inline-block">
              <button className="rounded-lg bg-[#0052FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052FF]/90">{t("sell_service")}</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {DEMO_SALES.map((order) => (
              <div key={order.id} className="rounded-xl border border-border/50 bg-card/50 p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{order.serviceTitle}</h3>
                    <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{order.totalAmount} USDC</span>
                </div>

                <div className="space-y-2">
                  {order.milestones.map((ms) => (
                    <div key={ms.index} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{ms.index + 1}.</span>
                        <span className="text-sm font-medium text-foreground">{ms.name}</span>
                        <span className="text-xs text-muted-foreground">{ms.percent}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[ms.status]}`}>
                          {ms.status}
                        </span>
                        {ms.status === "funded" && (
                          <button className="rounded-md border border-border/50 px-3 py-1 text-xs text-foreground hover:bg-foreground/5">
                            {t("mark_delivered")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
