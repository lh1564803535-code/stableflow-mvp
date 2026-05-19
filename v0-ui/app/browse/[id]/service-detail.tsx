"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArrowLeft } from "lucide-react";
import { useEscrowWrite } from "@/hooks/useEscrow";
import { CATEGORIES, SEEDED_SERVICES, shortAddress } from "@/lib/contracts";

export default function ServiceDetail({ id }: { id: string }) {
  const { isConnected } = useAccount();
  const { createOrder, approveUSDC, isPending, isConfirming, isSuccess, error } = useEscrowWrite();
  const [step, setStep] = useState<"idle" | "approving" | "creating" | "done">("idle");

  const service = SEEDED_SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-gray-400">Service not found.</p>
          <Link href="/browse" className="mt-4 inline-block text-[#0052FF] hover:underline">Back to browse</Link>
        </div>
      </div>
    );
  }

  const cat = CATEGORIES[service.category] || CATEGORIES.other;
  const fee = Math.round(service.priceUSDC * 0.02);
  const sellerReceives = service.priceUSDC - fee;

  const handleBuy = () => {
    if (!isConnected) return;
    setStep("approving");
    approveUSDC(String(service.priceUSDC));
  };

  useEffect(() => {
    if (step === "approving" && isSuccess) {
      setStep("creating");
      createOrder(
        service.sellerAddress as `0x${string}`,
        String(service.priceUSDC),
        service.milestones.map((m) => m.percent)
      );
    }
  }, [step, isSuccess]);

  useEffect(() => {
    if (step === "creating" && isSuccess) {
      setStep("done");
    }
  }, [step, isSuccess]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/browse" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <span className="text-sm text-gray-400">{cat.icon} {cat.label}</span>
              <h1 className="mt-2 text-2xl font-bold text-white">{service.title}</h1>
              <p className="mt-4 leading-relaxed text-gray-300">{service.description}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Milestones</h2>
              <div className="space-y-4">
                {service.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-sm font-mono text-[#0052FF]">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{m.name}</h3>
                        <span className="font-mono text-sm text-[#0052FF]">{m.percent}%</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm text-gray-400">Price</h3>
              <p className="mt-1 text-3xl font-bold text-white">{service.priceUSDC} USDC</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Platform Fee (2%)</span>
                  <span>{fee} USDC</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Seller Receives</span>
                  <span className="text-green-400">{sellerReceives} USDC</span>
                </div>
              </div>

              {!isConnected ? (
                <div className="mt-6">
                  <ConnectButton />
                </div>
              ) : step === "done" ? (
                <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-center text-sm text-green-400">
                  Order created! <Link href="/orders" className="underline">View orders</Link>
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={isPending || isConfirming}
                  className="mt-6 w-full rounded-lg bg-[#0052FF] py-3 text-sm font-medium text-white hover:bg-[#0052FF]/90 disabled:opacity-50"
                >
                  {isPending ? "Confirm..." : isConfirming ? "Processing..." : "Buy Service"}
                </button>
              )}

              {error && (
                <p className="mt-2 text-center text-xs text-red-400">{error.message?.slice(0, 150)}</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm text-gray-400">Seller</h3>
              <p className="mt-2 break-all font-mono text-sm text-white">{shortAddress(service.sellerAddress)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
