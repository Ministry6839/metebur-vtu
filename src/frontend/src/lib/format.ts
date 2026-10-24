import type { Timestamp } from "@/types";

/**
 * Backend `Time.now()` values are nanosecond bigints. Convert through this
 * helper before any JavaScript `Date` operation.
 */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Format a nanosecond timestamp as a short, readable date. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format a nanosecond timestamp as date + time. */
export function formatDateTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Relative time such as "3h ago" for recent activity. */
export function formatRelative(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

/** Format a kobo amount as Nigerian Naira. Amounts are stored in kobo (1/100). */
export function formatNaira(amount: bigint): string {
  const naira = Number(amount) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

/** Convert a Naira string entered by a user into kobo bigint. */
export function nairaToKobo(value: string): bigint {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return 0n;
  return BigInt(Math.round(parsed * 100));
}

/** Format a data volume in MB as a friendly GB/MB label. */
export function formatDataVolume(mb: bigint): string {
  const value = Number(mb);
  if (value >= 1024) {
    const gb = value / 1024;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
  }
  return `${value} MB`;
}

/** Format a validity window in days. */
export function formatValidity(days: bigint): string {
  const value = Number(days);
  if (value === 1) return "1 day";
  if (value >= 30 && value % 30 === 0) {
    const months = value / 30;
    return months === 1 ? "1 month" : `${months} months`;
  }
  return `${value} days`;
}

/** Shorten a principal for display in headers and receipts. */
export function shortPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 5)}…${principal.slice(-4)}`;
}

/** Normalize a Nigerian phone number to 11 digits where possible. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13)
    return `0${digits.slice(3)}`;
  return digits;
}

/** Validate a Nigerian mobile number (11 digits starting with 0). */
export function isValidPhone(input: string): boolean {
  return /^0\d{10}$/.test(normalizePhone(input));
}

export type { Timestamp };
