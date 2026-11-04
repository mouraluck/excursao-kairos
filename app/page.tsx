import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Bento } from "@/components/bento";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Bento />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
