import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NextAuthProvider from "@/components/layout/session-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextAuthProvider>
  );
}
