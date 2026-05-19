import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export const bookingSchema = z.object({
  vanId: z.string().min(1, "Please select a van"),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  pickupLocation: z.string().min(3, "Delivery address is required"),
  stateTaxCode: z.string().length(2, "Please select a state"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  licenseUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const vanSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  seats: z.number().int().min(1).max(15),
  cargoCapacity: z.string().min(1, "Cargo capacity is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true),
  features: z.array(z.string()).default([]),
});

export const settingsSchema = z.object({
  hourlyRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid rate"),
  insuranceFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid fee"),
  minHours: z.string().regex(/^\d+$/, "Invalid minimum hours"),
  lateReturnFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid fee"),
  cleaningFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid fee"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type VanInput = z.infer<typeof vanSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
