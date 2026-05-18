"use client";

import { formatCurrency, formatDateTime } from "./utils";

interface ReceiptData {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  vanName: string;
  startDate: Date | string;
  endDate: Date | string;
  hours: number;
  pickupLocation: string;
  rentalFee: number;
  insuranceFee: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  stateCode: string;
  paidAt?: Date | string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const margin = 20;

  // Header
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, W, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("DADA MOVING", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Van Rental Receipt", margin, 26);
  doc.text(`Houston, Texas`, margin, 33);

  // Booking number + date
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt #${data.bookingNumber}`, margin, 56);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Issued: ${data.paidAt ? formatDateTime(data.paidAt) : formatDateTime(new Date())}`,
    margin,
    63
  );

  // Customer info
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, 70, W - margin, 70);
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer", margin, 78);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10);
  doc.text(data.customerName, margin, 85);
  doc.text(data.customerEmail, margin, 91);

  // Booking details
  doc.line(margin, 98, W - margin, 98);
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Rental Details", margin, 106);

  const details = [
    ["Van", data.vanName],
    ["Pick Up", formatDateTime(data.startDate)],
    ["Return", formatDateTime(data.endDate)],
    ["Duration", `${data.hours} hour${data.hours !== 1 ? "s" : ""}`],
    ["Location", data.pickupLocation],
  ];

  let y = 114;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  for (const [label, value] of details) {
    doc.text(label, margin, y);
    doc.setTextColor(17, 24, 39);
    doc.text(value, 80, y);
    doc.setTextColor(107, 114, 128);
    y += 7;
  }

  // Price breakdown
  y += 4;
  doc.line(margin, y, W - margin, y);
  y += 8;
  doc.setTextColor(30, 58, 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Price Breakdown", margin, y);
  y += 8;

  const breakdown = [
    [`Rental Fee (${data.hours}h × $17.00)`, formatCurrency(data.rentalFee)],
    ["Insurance (fixed)", formatCurrency(data.insuranceFee)],
    ["Subtotal", formatCurrency(data.subtotal)],
    [`State Tax ${data.stateCode} (${(data.taxRate * 100).toFixed(2)}%)`, formatCurrency(data.taxAmount)],
  ];

  doc.setFont("helvetica", "normal");
  for (const [label, value] of breakdown) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.text(label, margin, y);
    doc.setTextColor(17, 24, 39);
    doc.text(value, W - margin, y, { align: "right" });
    y += 7;
  }

  // Total
  y += 2;
  doc.setFillColor(30, 58, 95);
  doc.roundedRect(margin, y, W - 2 * margin, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", margin + 6, y + 9);
  doc.text(formatCurrency(data.totalAmount), W - margin - 6, y + 9, { align: "right" });

  // No mileage badge
  y += 22;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, y, W - 2 * margin, 10, 2, 2, "F");
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("✓ No mileage fees — drive as much as you need!", W / 2, y + 6.5, { align: "center" });

  // Footer
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(9);
  doc.text("DADA MOVING · Houston, TX · dadamoving.com", W / 2, 285, { align: "center" });
  doc.text(`© ${new Date().getFullYear()} DADA MOVING. All rights reserved.`, W / 2, 290, { align: "center" });

  return doc.output("blob");
}
