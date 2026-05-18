import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, fmt);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `DADA-${year}-${random}`;
}

export function getBookingStatusColor(status: string): string {
  switch (status) {
    case "PENDING":   return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "CONFIRMED": return "text-blue-700 bg-blue-50 border-blue-200";
    case "ACTIVE":    return "text-green-700 bg-green-50 border-green-200";
    case "COMPLETED": return "text-gray-700 bg-gray-50 border-gray-200";
    case "CANCELLED": return "text-red-700 bg-red-50 border-red-200";
    default:          return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

export function getBookingStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":   return "Pending";
    case "CONFIRMED": return "Confirmed";
    case "ACTIVE":    return "Active";
    case "COMPLETED": return "Completed";
    case "CANCELLED": return "Cancelled";
    default:          return status;
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "PAID":     return "text-green-700 bg-green-50 border-green-200";
    case "UNPAID":   return "text-red-700 bg-red-50 border-red-200";
    case "REFUNDED": return "text-purple-700 bg-purple-50 border-purple-200";
    default:         return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

export function truncate(text: string, length = 150): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}
