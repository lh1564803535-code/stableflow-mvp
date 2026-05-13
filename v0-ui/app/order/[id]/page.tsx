"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useOrder, useMilestones, useEscrowWrite, formatUSDC } from "@/hooks/useEscrow";
import { shortAddress, MILESTONE_STATUS } from "@/lib/contracts";

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

function MilestoneRow({
  orderId, index, ms, order, onAction,
}: {
  orderId: number; index: number; ms: MilestoneData; order: OrderData; onAction: () => void;
}) {
  const { address } = useAccount();
  const { deliverMilestone, releaseMilestone, disputeMilestone, finalizeResolution, appealResolution, claimTimeoutRefund, isPending, isConfirming } = useEscrowWrite();

  const status = STATUS_MAP[ms.status] || STATUS_MAP[0];
  const isBuyer = address?.toLowerCase() === order.buyer.toLowerCase();
  const isSeller = address?.toLowerCase() === order.seller.toLowerCase();
  const amountUSDC = formatUSDC(ms.amount);

  const handleAction = (fn: () => void) => {
    fn();
    onAction();
  };

  const renderActions = () => {
    if (order.completed) return null;

    // Funded → Seller can deliver
    if (ms.status === 1 && isSeller) {
      return (
        <button
          onClick={() => handleAction(() => deliverMilestone(orderId, index))}
          disabled={isPending || isConfirming}
          className="rounded-md bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50"
        >
          {isPending ? "Signing..." : "Deliver"}
        </button>
      );
    }

    // Delivered → Buyer can release or dispute
    if (ms.status === 2 && isBuyer) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(() => releaseMilestone(orderId, index))}
            disabled={isPending || isConfirming}
            className="rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 disabled:opacity-50"
          >
            Release
          </button>
          <button
            onClick={() => handleAction(() => disputeMilestone(orderId, index))}
            disabled={isPending || isConfirming}
            className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-50"
          >
            Dispute
          </button>
        </div>
      );
    }

    // Disputed → Either party can claim timeout refund (if timeout reached)
    if (ms.status === 4) {
      return (
        <button
          onClick={() => handleAction(() => claimTimeoutRefund(orderId, index))}
          disabled={isPending || isConfirming}
          className="rounded-md bg-orange-500/20 px-3 py-1.5 text-xs font-medium text-orange-400 hover:bg-orange-500/30 disabled:opacity-50"
        >
          Claim Timeout Refund
        </button>
      );
    }

    // Pending Resolution → Either party can finalize or appeal
    if (ms.status === 5 && (isBuyer || isSeller)) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(() => finalizeResolution(orderId, index))}
            disabled={isPending || isConfirming}
            className="rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 disabled:opacity-50"
          >
            Finalize
          </button>
          <button
            onClick={() => handleAction(() => appealResolution(orderId, index))}
            disabled={isPending || isConfirming}
            className="rounded-md bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-400 hover:bg-purple-500/30 disabled:opacity-50"
          >
            Appeal
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0052FF]/20 text-sm font-mono text-[#0052FF]">
          {index + 1}
        </span>
        <div>
          <p className="text-sm font-medium text-white">{amountUSDC} USDC</p>
          <p className="text-xs text-gray-500">
            {ms.deliveredAt > 0 && `Delivered ${new Date(Number(ms.deliveredAt) * 1000).toLocaleDateString()}`}
            {ms.disputedAt > 0 && ` • Disputed ${new Date(Number(ms.disputedAt) * 1000).toLocaleDateString()}`}
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
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orderId = Number(id);
  const { isConnected } = useAccount();
  const { data: orderData, isLoading: orderLoading, refetch: refetchOrder } = useOrder(orderId);
  const { data: milestonesData, isLoading: msLoading, refetch: refetchMs } = useMilestones(orderId);

  const order = orderData as OrderData | undefined;
  const milestones = (milestonesData || []) as MilestoneData[];
  const isLoading = orderLoading || msLoading;

  const handleAction = () => {
    setTimeout(() => {
      refetchOrder();
      refetchMs();
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="mb-4 text-gray-400">Connect your wallet to view this order</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0052FF]" />
          <p className="mt-4 text-gray-400">Loading order #{orderId}...</p>
        </div>
      </div>
    );
  }

  if (!order || order.id === BigInt(0)) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-gray-400">Order #{orderId} not found</p>
          <Link href="/orders" className="mt-4 inline-block text-[#0052FF] hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const progress = order.totalAmount > BigInt(0)
    ? Number((order.releasedAmount * BigInt(100)) / order.totalAmount)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">Order #{orderId}</h1>
                {order.completed ? (
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">Completed</span>
                ) : (
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">Active</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Buyer</p>
                  <p className="font-mono text-white">{shortAddress(order.buyer)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Seller</p>
                  <p className="font-mono text-white">{shortAddress(order.seller)}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatUSDC(order.totalAmount)}</p>
              <p className="text-sm text-gray-500">USDC</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Released: {formatUSDC(order.releasedAmount)} USDC</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#0052FF] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Milestones ({milestones.length})
          </h2>
          <div className="space-y-3">
            {milestones.map((ms, i) => (
              <MilestoneRow
                key={i}
                orderId={orderId}
                index={i}
                ms={ms}
                order={order}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">
            Created {new Date(Number(order.createdAt) * 1000).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
