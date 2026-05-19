import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // For Google sign-in, fetch role from DB
        if (account?.provider === "google") {
          const dbUser = await db.user.findUnique({ where: { id: user.id } });
          token.role = dbUser?.role ?? "CUSTOMER";
          token.isActive = dbUser?.isActive ?? true;
        } else {
          token.role = (user as Record<string, unknown>).role;
          token.isActive = (user as Record<string, unknown>).isActive;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },
  events: {
    // When a user signs in with Google for the first time, ensure role is CUSTOMER
    async createUser({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "CUSTOMER", isActive: true },
        }).catch(() => {});
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
});
