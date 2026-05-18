import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "bookings@dadamoving.com";

// Named export for backwards compat — lazily initialized
export const resend = {
  emails: {
    send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args),
  },
};
