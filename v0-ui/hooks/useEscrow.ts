"use client";

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ESCROW_ADDRESS, ESCROW_ABI, USDC_ADDRESS, USDC_ABI } from "@/lib/contracts";

// ─── Read hooks ───

export function useOrderCount() {
  return useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getOrderCount",
  });
}

export function useOrder(orderId: number) {
  return useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getOrder",
    args: [BigInt(orderId)],
  });
}

export function useMilestones(orderId: number) {
  return useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getMilestones",
    args: [BigInt(orderId)],
  });
}

export function useUSDCBalance(address?: `0x${string}`) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

// ─── Write hook ───

export function useEscrowWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    hash, isPending, isConfirming, isSuccess, error,

    approveUSDC(amount: string) {
      writeContract({
        address: USDC_ADDRESS, abi: USDC_ABI, functionName: "approve",
        args: [ESCROW_ADDRESS, parseUnits(amount, 6)],
      });
    },

    createOrder(seller: `0x${string}`, amount: string, percents: number[]) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "createOrder",
        args: [seller, parseUnits(amount, 6), percents.map((p) => BigInt(Math.round(p * 100)))],
      });
    },

    deliverMilestone(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "deliverMilestone",
        args: [BigInt(orderId), BigInt(index)],
      });
    },

    releaseMilestone(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "releaseMilestone",
        args: [BigInt(orderId), BigInt(index)],
      });
    },

    disputeMilestone(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "disputeMilestone",
        args: [BigInt(orderId), BigInt(index)],
      });
    },

    resolveDispute(orderId: number, index: number, recipient: `0x${string}`, percent: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "resolveDispute",
        args: [BigInt(orderId), BigInt(index), recipient, BigInt(Math.round(percent * 100))],
      });
    },

    finalizeResolution(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "finalizeResolution",
        args: [BigInt(orderId), BigInt(index)],
      });
    },

    appealResolution(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "appealResolution",
        args: [BigInt(orderId), BigInt(index)],
      });
    },

    claimTimeoutRefund(orderId: number, index: number) {
      writeContract({
        address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "claimTimeoutRefund",
        args: [BigInt(orderId), BigInt(index)],
      });
    },
  };
}

export function formatUSDC(value: bigint): string {
  return formatUnits(value, 6);
}
