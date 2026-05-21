import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NextAuthProvider from "@/components/layout/session-provider";
import WhatsAppButton from "@/components/ui/whatsapp-button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </NextAuthProvider>
  );
}
