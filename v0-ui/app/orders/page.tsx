"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Plus, ChevronRight } from "lucide-react";
import { useOrderCount, useOrder, formatUSDC } from "@/hooks/useEscrow";
import { shortAddress, MILESTONE_STATUS } from "@/lib/contracts";

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

function OrderCard({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useOrder(orderId) as { data: OrderData | undefined; isLoading: boolean };

  if (isLoading || !order) {
    return (
      <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="mt-3 h-3 w-48 rounded bg-white/5" />
      </div>
    );
  }

  const progress = order.totalAmount > BigInt(0)
    ? Number((order.releasedAmount * BigInt(100)) / order.totalAmount)
    : 0;

  return (
    <Link
      href={`/order/${orderId}`}
      className="group block rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-[#0052FF]/30 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Order #{orderId}</h3>
            {order.completed ? (
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Completed</span>
            ) : (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">Active</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
            <span>Buyer: {shortAddress(order.buyer)}</span>
            <span>Seller: {shortAddress(order.seller)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{formatUSDC(order.totalAmount)} USDC</p>
          <p className="text-sm text-gray-500">{Number(order.milestoneCount)} milestones</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Released: {formatUSDC(order.releasedAmount)} USDC</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#0052FF] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end text-sm text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <ChevronRight className="ml-1 h-4 w-4" />
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const { isConnected } = useAccount();
  const { data: countData } = useOrderCount();
  const orderCount = countData ? Number(countData) : 0;

  // Build order IDs array (newest first)
  const orderIds = Array.from({ length: orderCount }, (_, i) => i).reverse();

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Orders</h1>
            <p className="mt-1 text-sm text-gray-400">
              {orderCount > 0 ? `${orderCount} order${orderCount > 1 ? "s" : ""} on-chain` : "No orders yet"}
            </p>
          </div>
          {isConnected && (
            <Link
              href="/create"
              className="flex items-center gap-2 rounded-lg bg-[#0052FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052FF]/90"
            >
              <Plus className="h-4 w-4" /> New Order
            </Link>
          )}
        </div>

        {!isConnected ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-gray-400">Connect your wallet to view orders</p>
            <ConnectButton />
          </div>
        ) : orderCount === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-lg text-gray-400">No orders yet</p>
            <p className="mt-2 text-sm text-gray-600">Create your first order to get started</p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0052FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052FF]/90"
            >
              <Plus className="h-4 w-4" /> Create Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderIds.map((id) => (
              <OrderCard key={id} orderId={id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
