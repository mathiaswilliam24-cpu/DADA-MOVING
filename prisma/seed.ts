import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding DADA MOVING database...");

  // ── App Settings ──────────────────────────────────────────────────────
  const settings = [
    { key: "hourlyRate",    value: "17" },
    { key: "insuranceFee",  value: "4" },
    { key: "minHours",      value: "2" },
    { key: "lateReturnFee", value: "25" },
    { key: "cleaningFee",   value: "75" },
    { key: "fuelPolicy",    value: "Return with the same fuel level. A $30 refueling fee applies otherwise." },
  ];
  for (const s of settings) {
    await db.appSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✓ App settings seeded");

  // ── State Taxes (all 50 states + DC) ─────────────────────────────────
  const stateTaxes = [
    { state: "AL", name: "Alabama",       taxRate: 0.04 },
    { state: "AK", name: "Alaska",        taxRate: 0.00 },
    { state: "AZ", name: "Arizona",       taxRate: 0.056 },
    { state: "AR", name: "Arkansas",      taxRate: 0.065 },
    { state: "CA", name: "California",    taxRate: 0.0725 },
    { state: "CO", name: "Colorado",      taxRate: 0.029 },
    { state: "CT", name: "Connecticut",   taxRate: 0.0635 },
    { state: "DE", name: "Delaware",      taxRate: 0.00 },
    { state: "FL", name: "Florida",       taxRate: 0.06 },
    { state: "GA", name: "Georgia",       taxRate: 0.04 },
    { state: "HI", name: "Hawaii",        taxRate: 0.04 },
    { state: "ID", name: "Idaho",         taxRate: 0.06 },
    { state: "IL", name: "Illinois",      taxRate: 0.0625 },
    { state: "IN", name: "Indiana",       taxRate: 0.07 },
    { state: "IA", name: "Iowa",          taxRate: 0.06 },
    { state: "KS", name: "Kansas",        taxRate: 0.065 },
    { state: "KY", name: "Kentucky",      taxRate: 0.06 },
    { state: "LA", name: "Louisiana",     taxRate: 0.0445 },
    { state: "ME", name: "Maine",         taxRate: 0.055 },
    { state: "MD", name: "Maryland",      taxRate: 0.06 },
    { state: "MA", name: "Massachusetts", taxRate: 0.0625 },
    { state: "MI", name: "Michigan",      taxRate: 0.06 },
    { state: "MN", name: "Minnesota",     taxRate: 0.06875 },
    { state: "MS", name: "Mississippi",   taxRate: 0.07 },
    { state: "MO", name: "Missouri",      taxRate: 0.04225 },
    { state: "MT", name: "Montana",       taxRate: 0.00 },
    { state: "NE", name: "Nebraska",      taxRate: 0.055 },
    { state: "NV", name: "Nevada",        taxRate: 0.0685 },
    { state: "NH", name: "New Hampshire", taxRate: 0.00 },
    { state: "NJ", name: "New Jersey",    taxRate: 0.06625 },
    { state: "NM", name: "New Mexico",    taxRate: 0.05 },
    { state: "NY", name: "New York",      taxRate: 0.04 },
    { state: "NC", name: "North Carolina",taxRate: 0.0475 },
    { state: "ND", name: "North Dakota",  taxRate: 0.05 },
    { state: "OH", name: "Ohio",          taxRate: 0.0575 },
    { state: "OK", name: "Oklahoma",      taxRate: 0.045 },
    { state: "OR", name: "Oregon",        taxRate: 0.00 },
    { state: "PA", name: "Pennsylvania",  taxRate: 0.06 },
    { state: "RI", name: "Rhode Island",  taxRate: 0.07 },
    { state: "SC", name: "South Carolina",taxRate: 0.06 },
    { state: "SD", name: "South Dakota",  taxRate: 0.045 },
    { state: "TN", name: "Tennessee",     taxRate: 0.07 },
    { state: "TX", name: "Texas",         taxRate: 0.0825 },
    { state: "UT", name: "Utah",          taxRate: 0.0485 },
    { state: "VT", name: "Vermont",       taxRate: 0.06 },
    { state: "VA", name: "Virginia",      taxRate: 0.053 },
    { state: "WA", name: "Washington",    taxRate: 0.065 },
    { state: "WV", name: "West Virginia", taxRate: 0.06 },
    { state: "WI", name: "Wisconsin",     taxRate: 0.05 },
    { state: "WY", name: "Wyoming",       taxRate: 0.04 },
    { state: "DC", name: "Washington DC", taxRate: 0.06 },
  ];
  for (const tax of stateTaxes) {
    await db.stateTax.upsert({
      where: { state: tax.state },
      update: { name: tax.name, taxRate: tax.taxRate },
      create: tax,
    });
  }
  console.log("✓ State taxes seeded (51 entries)");

  // ── Vans ──────────────────────────────────────────────────────────────
  const vans = [
    {
      name: "Cargo Pro 150",
      description: "Perfect for moves and large furniture. This spacious cargo van handles everything from studio apartments to office relocations with ease.",
      seats: 2,
      cargoCapacity: "250 cu ft",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      isAvailable: true,
      features: ["250 cu ft cargo space", "Loading ramp", "Tie-down anchors", "Rear cargo door", "GPS ready"],
    },
    {
      name: "Transit Connect",
      description: "Our most versatile van. Great for deliveries, small moves, and business use. Compact enough for city driving, big enough for what matters.",
      seats: 2,
      cargoCapacity: "135 cu ft",
      imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
      isAvailable: true,
      features: ["135 cu ft cargo space", "Dual sliding doors", "Fuel efficient", "Easy parking", "GPS ready"],
    },
    {
      name: "Compact Mover",
      description: "Ideal for smaller loads and tight spaces. Perfect for dorm moves, furniture pickups, and personal deliveries around the city.",
      seats: 2,
      cargoCapacity: "100 cu ft",
      imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80",
      isAvailable: true,
      features: ["100 cu ft cargo space", "Easy to drive", "Great fuel economy", "City-friendly size", "GPS ready"],
    },
    {
      name: "Premium Cargo 250",
      description: "Our largest van for the biggest jobs. Move a full 2-bedroom apartment or transport large business inventory with confidence.",
      seats: 2,
      cargoCapacity: "350 cu ft",
      imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
      isAvailable: true,
      features: ["350 cu ft cargo space", "Heavy duty suspension", "Loading ramp included", "Tall roof clearance", "GPS ready", "Cargo protection kit"],
    },
  ];

  for (const van of vans) {
    const existing = await db.van.findFirst({ where: { name: van.name } });
    if (!existing) {
      await db.van.create({ data: van });
    }
  }
  console.log("✓ Vans seeded (4 vans)");

  // ── Admin User ────────────────────────────────────────────────────────
  const adminEmail = "admin@dadamoving.com";
  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash("Admin@2024!", 12);
    await db.user.create({
      data: {
        name: "DADA Admin",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("✓ Admin user created → admin@dadamoving.com / Admin@2024!");
  } else {
    console.log("✓ Admin user already exists");
  }

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); await pool.end(); });
