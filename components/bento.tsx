"use client";

import { type ReactNode, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionProps,
} from "framer-motion";
import {
  BusFront,
  CalendarCheck,
  HeartHandshake,
  Map,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const reveal: MotionProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

function Cell({
  className,
  children,
  glow = "var(--kairos-yellow)",
}: {
  className?: string;
  children: ReactNode;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${x}px ${y}px, ${glow}, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      {...reveal}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        x.set(-999);
        y.set(-999);
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-surface p-7 shadow-(--shadow) transition-colors duration-500 hover:border-border-strong",
        className,
      )}
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.14]"
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="mb-5 inline-grid size-11 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-accent [&_svg]:size-5">
      {children}
    </span>
  );
}

const roteiros = [
  "Litoral",
  "Serra e clima de montanha",
  "Turismo religioso",
  "Compras",
  "Bate-volta",
  "Feriados prolongados",
];

export function Bento() {
  return (
    <section id="diferenciais" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...reveal} className="mb-14 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Por que viajar com a Kairós
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
            Tudo pensado para você{" "}
            <span className="text-accent">só aproveitar</span>.
          </h2>
          <p className="mt-5 text-xl text-muted">
            Segurança, conforto e roteiros bem construídos. O resto é a paisagem
            pela janela e boas companhias.
          </p>
        </motion.div>

        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
          {/* Segurança */}
          <Cell className="md:col-span-2 md:row-span-2">
            <Icon>
              <ShieldCheck />
            </Icon>
            <h3 className="font-display text-2xl font-semibold">
              Segurança do embarque ao retorno
            </h3>
            <p className="mt-3 max-w-md text-lg text-muted">
              Transporte com empresa regularizada, motorista profissional e
              acompanhamento da responsável durante toda a viagem. Horários,
              paradas e pontos de encontro combinados com antecedência.
            </p>
            <ul className="mt-auto grid grid-cols-1 gap-3 pt-8 text-base sm:grid-cols-2">
              {[
                "Lista de passageiros e check-in",
                "Contato direto no WhatsApp",
                "Paradas programadas",
                "Orientações antes de cada saída",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface-inset px-3 py-2"
                >
                  <span className="size-2 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Cell>

          {/* Conforto */}
          <Cell className="md:col-span-2">
            <Icon>
              <BusFront />
            </Icon>
            <h3 className="font-display text-2xl font-semibold">
              Conforto a bordo
            </h3>
            <p className="mt-3 text-lg text-muted">
              Ônibus executivo com poltronas reclináveis, ar-condicionado e
              espaço para bagagem. Viagem tranquila para chegar bem e aproveitar.
            </p>
          </Cell>

          {/* Roteiros */}
          <Cell className="md:col-span-2" glow="var(--kairos-gold)">
            <div id="roteiros" className="scroll-mt-32" />
            <Icon>
              <Map />
            </Icon>
            <h3 className="font-display text-2xl font-semibold">
              Roteiros que valem a viagem
            </h3>
            <p className="mt-3 text-lg text-muted">
              Destinos escolhidos a dedo e tempo bem distribuído entre passeio,
              descanso e boa comida.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {roteiros.map((r) => (
                <li
                  key={r}
                  className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  {r}
                </li>
              ))}
            </ul>
          </Cell>

          {/* Grupo */}
          <Cell className="md:col-span-1">
            <Icon>
              <Users />
            </Icon>
            <h3 className="font-display text-xl font-semibold">Em boa companhia</h3>
            <p className="mt-2 text-base text-muted">
              Grupos acolhedores, muita gente que volta viagem após viagem.
            </p>
          </Cell>

          {/* Organização */}
          <Cell className="md:col-span-1">
            <Icon>
              <CalendarCheck />
            </Icon>
            <h3 className="font-display text-xl font-semibold">Sem dor de cabeça</h3>
            <p className="mt-2 text-base text-muted">
              Reserva, pagamento e avisos organizados em um só lugar.
            </p>
          </Cell>

          {/* CTA */}
          <Cell
            className="border-kairos-yellow/50 bg-kairos-yellow text-kairos-black hover:border-kairos-yellow md:col-span-2"
            glow="#ffffff"
          >
            <span className="mb-5 inline-grid size-11 place-items-center rounded-2xl bg-kairos-black/10 text-kairos-black [&_svg]:size-5">
              <HeartHandshake />
            </span>
            <h3 className="font-display text-2xl font-semibold">
              Garanta seu lugar na próxima saída
            </h3>
            <p className="mt-2 max-w-md text-lg text-kairos-black/75">
              Chame no WhatsApp e receba datas, valores e roteiro completo.
            </p>
            <div className="mt-auto pt-6">
              <Button
                asChild
                size="lg"
                className="bg-kairos-black text-kairos-yellow hover:bg-kairos-ink hover:shadow-[0_0_40px_-8px_rgba(0,0,0,0.6)]"
              >
                <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="!size-5" />
                  Falar com a Analice
                </a>
              </Button>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}
