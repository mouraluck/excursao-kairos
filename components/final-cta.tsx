"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";

export function FinalCta() {
  return (
    <section id="contato" className="relative scroll-mt-24 px-6 pb-24 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-border bg-surface px-6 py-16 text-center sm:px-12 sm:py-24"
      >
        <div className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[50%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full glow-1 blur-[120px]" />

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          O momento certo é agora
        </p>
        <h2 className="font-display mx-auto max-w-3xl text-4xl font-semibold tracking-[-0.02em] sm:text-6xl">
          A próxima viagem começa com uma{" "}
          <span className="text-shimmer">mensagem</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-xl text-muted">
          Fale direto com a {site.owner}, tire dúvidas e reserve seu lugar sem
          formulário, sem espera.
        </p>
        <div className="mt-10 flex justify-center">
          <span className="relative inline-flex">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-kairos-yellow/60 animate-pulse-ring"
            />
            <Button asChild size="lg" className="relative">
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="!size-5" />
                Chamar no WhatsApp
              </a>
            </Button>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
