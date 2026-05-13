"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useEscrowWrite } from "@/hooks/useEscrow";

interface MilestoneForm {
  name: string;
  percent: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createOrder, approveUSDC, isPending, isConfirming, isSuccess, error } = useEscrowWrite();

  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { name: "Delivery", percent: 100 },
  ]);
  const [step, setStep] = useState<"idle" | "approving" | "creating" | "done">("idle");

  const totalPercent = milestones.reduce((sum, m) => sum + m.percent, 0);
  const isValid = seller.startsWith("0x") && seller.length === 42 && Number(amount) >= 1 && totalPercent === 100;

  const addMilestone = () => setMilestones([...milestones, { name: "", percent: 0 }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof MilestoneForm, value: string | number) => {
    const updated = [...milestones];
    updated[i] = { ...updated[i], [field]: value };
    setMilestones(updated);
  };

  const handleCreate = () => {
    if (!isValid) return;
    setStep("approving");
    approveUSDC(amount);
  };

  // Watch for approve success → trigger createOrder
  useEffect(() => {
    if (step === "approving" && isSuccess) {
      setStep("creating");
      createOrder(seller as `0x${string}`, amount, milestones.map((m) => m.percent));
    }
  }, [step, isSuccess]);

  // Watch for createOrder success
  useEffect(() => {
    if (step === "creating" && isSuccess) {
      setStep("done");
      setTimeout(() => router.push("/orders"), 2000);
    }
  }, [step, isSuccess]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-white">Create Order</h1>

        {!isConnected ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-gray-400">Connect your wallet to create an order</p>
            <ConnectButton />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seller Address */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">Seller Address</label>
              <input
                type="text"
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-600 focus:border-[#0052FF] focus:outline-none font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">Total Amount (USDC)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                placeholder="500"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-600 focus:border-[#0052FF] focus:outline-none"
              />
            </div>

            {/* Milestones */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm text-gray-400">Milestones</label>
                <span className={`font-mono text-sm ${totalPercent === 100 ? "text-green-400" : "text-red-400"}`}>
                  {totalPercent} / 100%
                </span>
              </div>

              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-xs font-mono text-[#0052FF]">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMilestone(i, "name", e.target.value)}
                      placeholder="Milestone name"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={m.percent || ""}
                      onChange={(e) => updateMilestone(i, "percent", Number(e.target.value))}
                      placeholder="%"
                      min="1"
                      max="100"
                      className="w-20 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-center text-sm text-white focus:border-[#0052FF] focus:outline-none"
                    />
                    <span className="text-sm text-gray-500">%</span>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)} className="text-gray-500 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {milestones.length < 10 && (
                <button
                  onClick={addMilestone}
                  className="mt-3 flex items-center gap-1 text-sm text-[#0052FF] hover:text-[#0052FF]/80"
                >
                  <Plus className="h-4 w-4" /> Add Milestone
                </button>
              )}
            </div>

            {/* Summary */}
            {Number(amount) > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Order Summary</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Total Amount</span>
                    <span className="text-white">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (2%)</span>
                    <span>{(Number(amount) * 0.02).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Receives</span>
                    <span className="text-green-400">{(Number(amount) * 0.98).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Milestones</span>
                    <span>{milestones.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error.message?.slice(0, 200)}
              </div>
            )}

            {/* Success */}
            {step === "done" && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
                Order created successfully! Redirecting...
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={!isValid || isPending || isConfirming || step === "done"}
              className="w-full rounded-lg bg-[#0052FF] py-3 text-sm font-medium text-white hover:bg-[#0052FF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Confirming..." : isConfirming ? "Processing..." : step === "done" ? "Created!" : "Create Order"}
            </button>

            <p className="text-center text-xs text-gray-600">
              You&apos;ll approve USDC spending first, then confirm the order creation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
