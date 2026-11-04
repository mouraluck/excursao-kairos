"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BusFront, CalendarDays, Check, Download, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { basePath, site } from "@/lib/site";
import { formatBRL, trips } from "@/lib/trips";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export function Trips() {
  return (
    <section id="viagens" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...reveal} className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Próximas viagens
          </p>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
            Escolha a sua e{" "}
            <span className="text-accent">reserve pelo WhatsApp</span>.
          </h2>
          <p className="mt-5 text-xl text-muted">
            Datas confirmadas, saídas combinadas e valores sem surpresa.
          </p>
        </motion.div>

        <div className="grid gap-8">
          {trips.map((trip) => (
            <motion.article
              key={trip.slug}
              {...reveal}
              className="grid overflow-hidden rounded-[2rem] border border-border bg-surface shadow-(--shadow) lg:grid-cols-[1.05fr_1fr]"
            >
              <div className="relative min-h-72 lg:min-h-full">
                <Image
                  src={`${basePath}${trip.image}`}
                  alt={trip.imageAlt}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-kairos-yellow px-4 py-2 text-sm font-bold text-kairos-black shadow-lg">
                  <CalendarDays className="size-4" />
                  {trip.weekday}, {trip.date}
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-kairos-yellow">
                    {trip.kind}
                  </p>
                  <h3 className="font-display text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">
                    {trip.destination}
                  </h3>
                </div>
                <a
                  href={trip.credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-3 text-[11px] text-white/60 hover:text-white"
                >
                  Foto: {trip.credit.name}
                </a>
              </div>

              <div className="flex flex-col gap-6 p-7 sm:p-9">
                <p className="text-lg text-muted">{trip.summary}</p>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      <BusFront className="size-4" /> Saídas
                    </h4>
                    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface-inset">
                      {trip.departures.map((d) => (
                        <li
                          key={d.place}
                          className="flex items-center justify-between px-4 py-2.5 text-base"
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="size-4 text-accent" />
                            {d.place}
                          </span>
                          <span className="font-display text-xl font-semibold">
                            {d.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      Incluso
                    </h4>
                    <ul className="space-y-2 text-base">
                      {trip.included.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-1 size-4 shrink-0 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-accent/30 bg-accent/10 p-5">
                  <div>
                    <p className="text-sm font-medium text-muted">Por pessoa</p>
                    <p className="font-display text-4xl font-semibold text-foreground">
                      {formatBRL(trip.price.adult)}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted">
                    {trip.price.child && (
                      <p>
                        Crianças de {trip.price.child.ages}:{" "}
                        <strong className="text-foreground">
                          {formatBRL(trip.price.child.value)}
                        </strong>
                      </p>
                    )}
                    <p>
                      Reserva com sinal de{" "}
                      <strong className="text-foreground">{formatBRL(trip.deposit)}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="!size-5" />
                      Reservar minha vaga
                    </a>
                  </Button>
                  {trip.banner && (
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                      <a href={`${basePath}${trip.banner}`} download>
                        <Download />
                        Baixar o banner
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
