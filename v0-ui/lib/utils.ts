import { type Address, isAddress, getAddress } from "viem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ---------------------------------------------------------------------------
// Tailwind Class Merge
// ---------------------------------------------------------------------------

/** Merge Tailwind classes with clsx + tailwind-merge (re-export for convenience). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Address Utilities
// ---------------------------------------------------------------------------

/** Returns true when `value` is a valid EVM address. */
export function isValidAddress(value: string): boolean {
  try {
    return isAddress(value);
  } catch {
    return false;
  }
}

/**
 * Format an address to the common "0x1234…abcd" shorthand.
 *
 * @example truncateAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")
 * // "0x8335…2913"
 */
export function truncateAddress(address: Address, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}\u2026${address.slice(-chars)}`;
}

/**
 * Returns the checksummed address, or undefined if invalid.
 */
export function safeChecksum(address: string): Address | undefined {
  try {
    return getAddress(address);
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Number / Currency Formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as a compact USD string.
 *
 * @example formatUsd(1234567) // "$1.23M"
 * @example formatUsd(0.0045) // "$0.0045"
 */
export function formatUsd(value: number, decimals: number = 2): string {
  if (value === 0) return "$0";

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (abs >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (abs >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }

  // For very small values, avoid rounding to $0.00
  const dynamicDecimals = abs < 0.01 ? 4 : decimals;
  return `$${value.toFixed(dynamicDecimals)}`;
}

/**
 * Format a raw bigint (e.g. wei / lamports) to a human-readable decimal string.
 *
 * @example formatBigInt(1500000000000000000n, 18) // "1.5"
 */
export function formatBigInt(
  value: bigint,
  decimals: number,
  precision: number = 4,
): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === BigInt(0)) return whole.toLocaleString("en-US");

  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmed = fractionStr.slice(0, precision);
  return `${whole.toLocaleString("en-US")}.${trimmed}`;
}

// ---------------------------------------------------------------------------
// Time Helpers
// ---------------------------------------------------------------------------

/** Convert a Unix timestamp (seconds) to a relative "time ago" string. */
export function timeAgo(unixSeconds: number | bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const ts = typeof unixSeconds === "bigint"
    ? Number(unixSeconds)
    : unixSeconds;

  const diff = now - ts;

  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2_592_000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31_536_000) return `${Math.floor(diff / 2_592_000)}mo ago`;
  return `${Math.floor(diff / 31_536_000)}y ago`;
}

/** Format a Unix timestamp to a locale-aware date string. */
export function formatDate(
  unixSeconds: number | bigint,
  options?: Intl.DateTimeFormatOptions,
): string {
  const ts = typeof unixSeconds === "bigint"
    ? Number(unixSeconds)
    : unixSeconds;

  return new Date(ts * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Misc Helpers
// ---------------------------------------------------------------------------

/** Sleep for `ms` milliseconds. Useful for debounce / retry logic. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Assert that an environment variable is set, throwing a clear error if not. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[StableFlow] Missing required environment variable: ${name}`,
    );
  }
  return value;
}

/** Simple error-message extractor that never throws. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}
