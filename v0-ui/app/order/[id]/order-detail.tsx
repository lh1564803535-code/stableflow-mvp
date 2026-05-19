"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useOrder, useMilestones, formatUSDC } from "@/hooks/useEscrow";
import { shortAddress } from "@/lib/contracts";
import { MilestoneRow } from "./milestone-row";
import { Toast } from "./toast";

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

export default function OrderDetail({ id }: { id: string }) {
  const orderId = Number(id);
  const { isConnected } = useAccount();
  const { data: orderData, isLoading: orderLoading, refetch: refetchOrder } = useOrder(orderId);
  const { data: milestonesData, isLoading: msLoading, refetch: refetchMs } = useMilestones(orderId);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const order = orderData as OrderData | undefined;
  const milestones = (milestonesData || []) as MilestoneData[];
  const isLoading = orderLoading || msLoading;

  const handleSuccess = useCallback((msg: string) => {
    setToast({ message: msg, type: "success" });
    setTimeout(() => {
      refetchOrder();
      refetchMs();
    }, 2000);
  }, [refetchOrder, refetchMs]);

  const handleError = useCallback((msg: string) => {
    setToast({ message: msg, type: "error" });
  }, []);

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

  const platformFee = (order.totalAmount * BigInt(2)) / BigInt(100);
  const remaining = order.totalAmount - order.releasedAmount;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
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
            <div className="h-2.5 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Fund Info Card */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-1 text-lg font-bold text-white">{formatUSDC(order.totalAmount)}</p>
            <p className="text-xs text-gray-600">USDC</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Released</p>
            <p className="mt-1 text-lg font-bold text-green-400">{formatUSDC(order.releasedAmount)}</p>
            <p className="text-xs text-gray-600">USDC</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="mt-1 text-lg font-bold text-yellow-400">{formatUSDC(remaining)}</p>
            <p className="text-xs text-gray-600">USDC</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">Platform Fee</p>
            <p className="mt-1 text-lg font-bold text-gray-300">{formatUSDC(platformFee)}</p>
            <p className="text-xs text-gray-600">2%</p>
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
                totalAmount={order.totalAmount}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            ))}
          </div>
        </div>

        {/* Created info */}
        <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">
            Created {new Date(Number(order.createdAt) * 1000).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
