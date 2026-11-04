import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} | Viagens em grupo com conforto e segurança`,
  description:
    "Excursões em grupo com roteiros pensados nos detalhes, conforto a bordo e acompanhamento do início ao fim. Fale com a Excursão Kairós pelo WhatsApp.",
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description:
      "Roteiros, conforto e segurança em cada viagem. Fale com a gente pelo WhatsApp.",
    locale: "pt_BR",
    type: "website",
  },
};

// Aplica o tema salvo antes da primeira pintura, sem flash. O padrão é o claro.
const themeScript = `(function(){try{var t=localStorage.getItem("kairos-theme");if(t==="dark"){document.documentElement.dataset.theme="dark"}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="kairos-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
