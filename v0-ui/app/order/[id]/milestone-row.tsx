"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { useEscrowWrite, formatUSDC } from "@/hooks/useEscrow";

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: "None", color: "text-gray-400", bg: "bg-gray-500/10" },
  1: { label: "Funded", color: "text-blue-400", bg: "bg-blue-500/10" },
  2: { label: "Delivered", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  3: { label: "Released", color: "text-green-400", bg: "bg-green-500/10" },
  4: { label: "Disputed", color: "text-red-400", bg: "bg-red-500/10" },
  5: { label: "Pending", color: "text-purple-400", bg: "bg-purple-500/10" },
};

interface OrderData {
  id: bigint;
  buyer: string;
  seller: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  milestoneCount: bigint;
  createdAt: bigint;
  completed: boolean;
}

interface MilestoneData {
  amount: bigint;
  status: number;
  deliveredAt: bigint;
  releasedAt: bigint;
  disputedAt: bigint;
  disputeInitiator: string;
  pendingRecipient: string;
  pendingPercent: bigint;
  resolvedAt: bigint;
}

export function MilestoneRow({
  orderId, index, ms, order, totalAmount, onSuccess, onError,
}: {
  orderId: number;
  index: number;
  ms: MilestoneData;
  order: OrderData;
  totalAmount: bigint;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const { address } = useAccount();
  const { deliverMilestone, releaseMilestone, disputeMilestone, finalizeResolution, appealResolution, claimTimeoutRefund, isPending, isConfirming, isSuccess, error } = useEscrowWrite();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const status = STATUS_MAP[ms.status] || STATUS_MAP[0];
  const isBuyer = address?.toLowerCase() === order.buyer.toLowerCase();
  const isSeller = address?.toLowerCase() === order.seller.toLowerCase();
  const amountUSDC = formatUSDC(ms.amount);
  const percent = totalAmount > BigInt(0)
    ? Number((ms.amount * BigInt(100)) / totalAmount)
    : 0;

  useEffect(() => {
    if (actionInProgress && isSuccess) {
      onSuccess(`Milestone ${index + 1}: ${actionInProgress} successful`);
      setActionInProgress(null);
    }
  }, [isSuccess, actionInProgress, index, onSuccess]);

  useEffect(() => {
    if (actionInProgress && error) {
      onError(error.message?.slice(0, 100) || "Transaction failed");
      setActionInProgress(null);
    }
  }, [error, actionInProgress, onError]);

  const handleAction = (label: string, fn: () => void) => {
    setActionInProgress(label);
    fn();
  };

  const renderActions = () => {
    if (order.completed) return null;
    const loading = isPending || isConfirming;

    if (ms.status === 1 && isSeller) {
      return (
        <button
          onClick={() => handleAction("Deliver", () => deliverMilestone(orderId, index))}
          disabled={loading}
          className="rounded-md bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading && actionInProgress === "Deliver" && <Loader2 className="h-3 w-3 animate-spin" />}
          Mark as Delivered
        </button>
      );
    }

    if (ms.status === 2 && isBuyer) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("Release", () => releaseMilestone(orderId, index))}
            disabled={loading}
            className="rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && actionInProgress === "Release" && <Loader2 className="h-3 w-3 animate-spin" />}
            Release Funds
          </button>
          <button
            onClick={() => handleAction("Dispute", () => disputeMilestone(orderId, index))}
            disabled={loading}
            className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && actionInProgress === "Dispute" && <Loader2 className="h-3 w-3 animate-spin" />}
            Dispute
          </button>
        </div>
      );
    }

    if (ms.status === 4 && (isBuyer || isSeller)) {
      return (
        <button
          onClick={() => handleAction("Timeout Refund", () => claimTimeoutRefund(orderId, index))}
          disabled={loading}
          className="rounded-md bg-orange-500/20 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading && actionInProgress === "Timeout Refund" && <Loader2 className="h-3 w-3 animate-spin" />}
          Claim Timeout Refund
        </button>
      );
    }

    if (ms.status === 5 && (isBuyer || isSeller)) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("Finalize", () => finalizeResolution(orderId, index))}
            disabled={loading}
            className="rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && actionInProgress === "Finalize" && <Loader2 className="h-3 w-3 animate-spin" />}
            Finalize
          </button>
          <button
            onClick={() => handleAction("Appeal", () => appealResolution(orderId, index))}
            disabled={loading}
            className="rounded-md bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && actionInProgress === "Appeal" && <Loader2 className="h-3 w-3 animate-spin" />}
            Appeal
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-sm font-mono font-bold text-[#0052FF]">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white">{amountUSDC} USDC</p>
              <span className="text-xs text-gray-500">({percent}%)</span>
            </div>
            <p className="text-xs text-gray-500">
              {ms.deliveredAt > BigInt(0) && `Delivered ${new Date(Number(ms.deliveredAt) * 1000).toLocaleDateString()}`}
              {ms.releasedAt > BigInt(0) && ` • Released ${new Date(Number(ms.releasedAt) * 1000).toLocaleDateString()}`}
              {ms.disputedAt > BigInt(0) && ` • Disputed ${new Date(Number(ms.disputedAt) * 1000).toLocaleDateString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          {renderActions()}
        </div>
      </div>
    </div>
  );
}
