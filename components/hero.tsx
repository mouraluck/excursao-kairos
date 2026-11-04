"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { logoSrc, site } from "@/lib/site";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const headline = ["Viaje", "no", "tempo", "certo."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const yLogo = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-20"
    >
      {/* Fundo dinâmico */}
      <div className="bg-grid absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_100%)]" />
      <motion.div
        style={{ y: yGlow }}
        className="absolute left-1/2 top-[-10%] -z-10 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full glow-1 blur-[140px]"
      />
      <motion.div
        style={{ y: yGlow }}
        className="absolute right-[-10%] top-[40%] -z-10 h-[40vh] w-[40vw] rounded-full glow-2 blur-[120px]"
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{ opacity }}
          className="relative"
        >
          <motion.div
            variants={fadeUp}
            className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-foreground"
          >
            <Sparkles className="size-4 text-accent" />
            Excursões em grupo · saídas de São Paulo
          </motion.div>

          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
            {headline.map((word, i) => (
              <motion.span
                key={word}
                variants={fadeUp}
                className={
                  i === headline.length - 1
                    ? "text-shimmer mr-3 inline-block"
                    : "mr-3 inline-block"
                }
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-xl text-xl leading-relaxed text-muted sm:text-2xl"
          >
            <em className="not-italic font-semibold text-foreground">Kairós</em> é o momento
            oportuno. Roteiros pensados nos detalhes, conforto a bordo e alguém
            cuidando de cada etapa, para você só se preocupar em viver a viagem.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center"
          >
            <span className="relative inline-flex w-full sm:w-auto">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-kairos-yellow/60 animate-pulse-ring"
              />
              <Button asChild size="lg" className="relative w-full px-5 sm:w-auto sm:px-8">
                <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="!size-5" />
                  Quero saber das próximas viagens
                </a>
              </Button>
            </span>
            <Button asChild variant="outline" size="lg">
              <a href="#viagens">
                Ver próximas viagens
                <ArrowDown />
              </a>
            </Button>
          </motion.div>

          <motion.ul
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-base text-muted"
          >
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent" />
              Transporte e guia acompanhando o grupo
            </li>
            <li className="flex items-center gap-2">
              <WhatsAppIcon className="size-5 text-accent" />
              Resposta rápida pelo WhatsApp
            </li>
          </motion.ul>
        </motion.div>

        {/* Logo em vidro com paralaxe */}
        <motion.div
          style={{ y: yLogo }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div className="absolute inset-0 -z-10 rounded-full glow-1 blur-3xl" />
          <div className="glass animate-float rounded-[2.5rem] p-6 sm:p-8">
            <div className="relative aspect-square overflow-hidden rounded-full ring-1 ring-kairos-yellow/40 shadow-[0_0_80px_-20px_var(--kairos-yellow)]">
              <Image
                src={logoSrc}
                alt="Logo da Excursão Kairós: uma ampulheta dourada sobre fundo amarelo"
                fill
                unoptimized
                priority
                loading="eager"
                sizes="(min-width: 1024px) 448px, 384px"
                className="object-cover"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              <span className="font-display text-sm font-medium text-foreground">
                {site.owner}
              </span>
              <span className="rounded-full border border-accent/40 px-2.5 py-1 font-medium text-accent">
                {site.instagramHandle}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
