"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Plus, ChevronRight, Store, ShoppingBag } from "lucide-react";
import { useOrderCount, useOrder, formatUSDC } from "@/hooks/useEscrow";
import { shortAddress } from "@/lib/contracts";

type FilterStatus = "all" | "active" | "completed" | "disputed";

const FILTERS: { key: FilterStatus; label: string; color: string }[] = [
  { key: "all", label: "All", color: "bg-white/10 text-white" },
  { key: "active", label: "Active", color: "bg-blue-500/10 text-blue-400" },
  { key: "completed", label: "Completed", color: "bg-green-500/10 text-green-400" },
  { key: "disputed", label: "Disputed", color: "bg-red-500/10 text-red-400" },
];

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

function OrderCard({ orderId, filter }: { orderId: number; filter: FilterStatus }) {
  const { data: order, isLoading } = useOrder(orderId) as { data: OrderData | undefined; isLoading: boolean };
  const { address } = useAccount();

  if (isLoading || !order) {
    return (
      <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="mt-3 h-3 w-48 rounded bg-white/5" />
      </div>
    );
  }

  // Filter logic — return null if doesn't match
  if (filter === "active" && order.completed) return null;
  if (filter === "completed" && !order.completed) return null;
  // For "disputed" we'd need milestone data; for now show active non-completed orders
  if (filter === "disputed") return null;

  const progress = order.totalAmount > BigInt(0)
    ? Number((order.releasedAmount * BigInt(100)) / order.totalAmount)
    : 0;

  const isParty =
    address?.toLowerCase() === order.buyer.toLowerCase() ||
    address?.toLowerCase() === order.seller.toLowerCase();

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
              <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                Completed
              </span>
            ) : (
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                Active
              </span>
            )}
            {isParty && (
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                You
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
            <span>Buyer: {shortAddress(order.buyer)}</span>
            <span>Seller: {shortAddress(order.seller)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">{formatUSDC(order.totalAmount)}</p>
          <p className="text-xs text-gray-500">USDC</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Released: {formatUSDC(order.releasedAmount)} USDC</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {Number(order.milestoneCount)} milestones • Created {new Date(Number(order.createdAt) * 1000).toLocaleDateString()}
        </span>
        <span className="flex items-center text-sm text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity">
          View Details <ChevronRight className="ml-1 h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const { isConnected } = useAccount();
  const { data: countData } = useOrderCount();
  const orderCount = countData ? Number(countData) : 0;
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentFilter = (searchParams.get("status") as FilterStatus) || "all";

  const setFilter = (f: FilterStatus) => {
    if (f === "all") {
      router.push("/orders");
    } else {
      router.push(`/orders?status=${f}`);
    }
  };

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

        {/* Status Filter Tabs */}
        {isConnected && orderCount > 0 && (
          <div className="mb-6 flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  currentFilter === f.key
                    ? f.color + " ring-1 ring-white/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {!isConnected ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-gray-400">Connect your wallet to view orders</p>
            <ConnectButton />
          </div>
        ) : orderCount === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <ShoppingBag className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-lg text-gray-300">No orders yet</p>
            <p className="mt-2 text-sm text-gray-500">Create your first order or browse available services</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/browse"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <Store className="h-4 w-4" /> Browse Services
              </Link>
              <Link
                href="/create"
                className="flex items-center gap-2 rounded-lg bg-[#0052FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0052FF]/90"
              >
                <Plus className="h-4 w-4" /> Create Order
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orderIds.map((id) => (
              <OrderCard key={id} orderId={id} filter={currentFilter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
