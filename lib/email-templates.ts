import { formatCurrency, formatDateTime } from "./utils";

interface BookingEmailData {
  customerName: string;
  bookingNumber: string;
  vanName: string;
  startDate: Date | string;
  endDate: Date | string;
  hours: number;
  pickupLocation: string;
  rentalFee: number;
  insuranceFee: number;
  taxAmount: number;
  totalAmount: number;
  stateCode: string;
}

export function bookingConfirmationHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .header { background: #1E3A5F; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: #94a3b8; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .section { background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .section-title { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #6b7280; font-size: 14px; }
    .row .value { color: #111827; font-size: 14px; font-weight: 500; }
    .total-row { background: #1E3A5F; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .total-row .label { color: #94a3b8; font-weight: 600; }
    .total-row .value { color: #fff; font-size: 20px; font-weight: 700; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
    .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 12px; }
    .no-mileage { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; color: #1d4ed8; font-size: 13px; font-weight: 500; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>DADA MOVING</h1>
      <p>Van Rental Confirmation</p>
    </div>
    <div class="body">
      <p class="greeting">Hi ${data.customerName},</p>
      <p class="subtitle">Your van rental has been confirmed! Here are your booking details:</p>
      <span class="badge">✓ Booking Confirmed</span>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="row"><span class="label">Booking #</span><span class="value">${data.bookingNumber}</span></div>
        <div class="row"><span class="label">Van</span><span class="value">${data.vanName}</span></div>
        <div class="row"><span class="label">Pick Up</span><span class="value">${formatDateTime(data.startDate)}</span></div>
        <div class="row"><span class="label">Return</span><span class="value">${formatDateTime(data.endDate)}</span></div>
        <div class="row"><span class="label">Duration</span><span class="value">${data.hours} hour${data.hours !== 1 ? "s" : ""}</span></div>
        <div class="row"><span class="label">Location</span><span class="value">${data.pickupLocation}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Price Breakdown</div>
        <div class="row"><span class="label">Rental Fee (${data.hours}h × $17)</span><span class="value">${formatCurrency(data.rentalFee)}</span></div>
        <div class="row"><span class="label">Insurance (fixed)</span><span class="value">${formatCurrency(data.insuranceFee)}</span></div>
        <div class="row"><span class="label">State Tax (${data.stateCode})</span><span class="value">${formatCurrency(data.taxAmount)}</span></div>
      </div>

      <div class="total-row">
        <span class="label">Total Charged</span>
        <span class="value">${formatCurrency(data.totalAmount)}</span>
      </div>

      <div class="no-mileage">✓ No mileage fees — drive as much as you need!</div>
    </div>
    <div class="footer">
      DADA MOVING · Houston, TX<br>
      Questions? Reply to this email or call us.<br>
      © ${new Date().getFullYear()} DADA MOVING. All rights reserved.
    </div>
  </div>
</div>
</body>
</html>
`;
}

export function bookingConfirmationText(data: BookingEmailData): string {
  return `
DADA MOVING — Booking Confirmed

Hi ${data.customerName},

Booking #: ${data.bookingNumber}
Van: ${data.vanName}
Pick Up: ${formatDateTime(data.startDate)}
Return: ${formatDateTime(data.endDate)}
Duration: ${data.hours} hours
Location: ${data.pickupLocation}

PRICE BREAKDOWN
Rental Fee: ${formatCurrency(data.rentalFee)}
Insurance: ${formatCurrency(data.insuranceFee)}
State Tax (${data.stateCode}): ${formatCurrency(data.taxAmount)}
TOTAL: ${formatCurrency(data.totalAmount)}

✓ No mileage fees!

Thank you for choosing DADA MOVING.
`.trim();
}
