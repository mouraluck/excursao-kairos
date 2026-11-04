import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Bento } from "@/components/bento";
import { Trips } from "@/components/trips";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Trips />
        <Bento />
        <FinalCta />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
