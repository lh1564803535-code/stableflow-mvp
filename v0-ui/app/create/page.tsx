"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { ArrowLeft, Plus, X, Check, Loader2 } from "lucide-react";
import { useEscrowWrite } from "@/hooks/useEscrow";

interface MilestoneForm {
  name: string;
  percent: string;
}

interface ValidationErrors {
  seller?: string;
  amount?: string;
  milestones?: string;
  milestoneItems?: Record<number, string>;
}

const STEPS = [
  { label: "Connect Wallet", key: "wallet" },
  { label: "Fill Details", key: "form" },
  { label: "Approve USDC", key: "approving" },
  { label: "Create Order", key: "creating" },
  { label: "Done", key: "done" },
];

function isValidEthAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { createOrder, approveUSDC, isPending, isConfirming, isSuccess, error } = useEscrowWrite();

  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    { name: "Delivery", percent: "100" },
  ]);
  const [step, setStep] = useState<"idle" | "approving" | "creating" | "done">("idle");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const totalPercent = milestones.reduce((sum, m) => sum + (parseInt(m.percent) || 0), 0);

  // Validation
  const validate = useCallback((): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (seller && !isValidEthAddress(seller)) {
      errs.seller = "Invalid Ethereum address (must be 0x + 40 hex characters)";
    }
    const numAmount = parseFloat(amount);
    if (amount && (isNaN(numAmount) || numAmount < 1)) {
      errs.amount = "Minimum amount is 1 USDC";
    } else if (amount && numAmount > 10000) {
      errs.amount = "Maximum amount is 10,000 USDC";
    }
    const milestoneItemErrors: Record<number, string> = {};
    milestones.forEach((m, i) => {
      const p = parseInt(m.percent) || 0;
      if (p < 1) milestoneItemErrors[i] = "Each milestone must be at least 1%";
    });
    if (Object.keys(milestoneItemErrors).length > 0) {
      errs.milestoneItems = milestoneItemErrors;
    }
    if (totalPercent !== 100 && milestones.some((m) => m.percent !== "")) {
      errs.milestones = `Total must equal 100% (currently ${totalPercent}%)`;
    }
    return errs;
  }, [seller, amount, milestones, totalPercent]);

  useEffect(() => {
    setErrors(validate());
  }, [validate]);

  const isValid =
    isValidEthAddress(seller) &&
    parseFloat(amount) >= 1 &&
    parseFloat(amount) <= 10000 &&
    totalPercent === 100 &&
    milestones.every((m) => (parseInt(m.percent) || 0) >= 1);

  const addMilestone = () => setMilestones([...milestones, { name: "", percent: "" }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof MilestoneForm, value: string) => {
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
      const percents = milestones.map((m) => parseInt(m.percent) || 0);
      createOrder(seller as `0x${string}`, amount, percents);
    }
  }, [step, isSuccess]);

  // Watch for createOrder success
  useEffect(() => {
    if (step === "creating" && isSuccess) {
      setStep("done");
      setTimeout(() => router.push("/orders"), 2000);
    }
  }, [step, isSuccess]);

  // Determine current step index for progress indicator
  const getCurrentStep = (): number => {
    if (!isConnected) return 0;
    if (step === "idle") return 1;
    if (step === "approving") return 2;
    if (step === "creating") return 3;
    if (step === "done") return 4;
    return 1;
  };

  const currentStep = getCurrentStep();

  // BigInt-safe amount calculations for display
  const platformFee = amount && parseFloat(amount) >= 1
    ? (BigInt(Math.round(parseFloat(amount) * 1_000_000)) * BigInt(2)) / BigInt(100)
    : BigInt(0);
  const sellerReceives = amount && parseFloat(amount) >= 1
    ? BigInt(Math.round(parseFloat(amount) * 1_000_000)) - platformFee
    : BigInt(0);

  const formatBigIntUSDC = (val: bigint): string => {
    const whole = val / BigInt(1_000_000);
    const frac = val % BigInt(1_000_000);
    return `${whole}.${frac.toString().padStart(6, "0").slice(0, 2)}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        <Link href="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-white">Create Order</h1>

        {/* Progress Steps */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      i < currentStep
                        ? "bg-green-500 text-white"
                        : i === currentStep
                        ? "bg-[#0052FF] text-white"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`mt-1 text-[10px] ${i <= currentStep ? "text-white" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-6 sm:w-10 ${
                      i < currentStep ? "bg-green-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

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
                onBlur={() => setTouched((t) => ({ ...t, seller: true }))}
                placeholder="0x..."
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none font-mono text-sm ${
                  touched.seller && errors.seller
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-[#0052FF]"
                }`}
              />
              {touched.seller && errors.seller && (
                <p className="mt-1.5 text-xs text-red-400">{errors.seller}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm text-gray-400">Total Amount (USDC)</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) setAmount(val);
                }}
                onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                placeholder="500"
                className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none ${
                  touched.amount && errors.amount
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/10 focus:border-[#0052FF]"
                }`}
              />
              {touched.amount && errors.amount && (
                <p className="mt-1.5 text-xs text-red-400">{errors.amount}</p>
              )}
            </div>

            {/* Milestones */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm text-gray-400">Milestones</label>
                <span className={`font-mono text-sm ${totalPercent === 100 ? "text-green-400" : "text-red-400"}`}>
                  {totalPercent} / 100%
                </span>
              </div>

              {errors.milestones && (
                <p className="mb-2 text-xs text-red-400">{errors.milestones}</p>
              )}

              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
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
                        type="text"
                        inputMode="numeric"
                        value={m.percent}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d+$/.test(val)) updateMilestone(i, "percent", val);
                        }}
                        placeholder="%"
                        className={`w-20 rounded-md border bg-white/5 px-2 py-1 text-center text-sm text-white focus:outline-none ${
                          errors.milestoneItems?.[i]
                            ? "border-red-500"
                            : "border-white/10 focus:border-[#0052FF]"
                        }`}
                      />
                      <span className="text-sm text-gray-500">%</span>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(i)} className="text-gray-500 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {errors.milestoneItems?.[i] && (
                      <p className="mt-1 ml-10 text-xs text-red-400">{errors.milestoneItems[i]}</p>
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

            {/* Summary with BigInt precision */}
            {parseFloat(amount) >= 1 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Order Summary</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Total Amount</span>
                    <span className="text-white">{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (2%)</span>
                    <span>{formatBigIntUSDC(platformFee)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Receives</span>
                    <span className="text-green-400">{formatBigIntUSDC(sellerReceives)} USDC</span>
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
                ✓ Order created successfully! Redirecting...
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={!isValid || isPending || isConfirming || step === "done"}
              className="w-full rounded-lg bg-[#0052FF] py-3 text-sm font-medium text-white hover:bg-[#0052FF]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isPending || isConfirming) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending
                ? "Confirming in wallet..."
                : isConfirming
                ? "Processing on-chain..."
                : step === "done"
                ? "Created!"
                : "Create Order"}
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
