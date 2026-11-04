"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoSrc, nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2 transition-all duration-500",
          scrolled
            ? "glass shadow-(--shadow)"
            : "border border-transparent bg-transparent",
        )}
      >
        <Link href="#top" className="flex items-center gap-3" aria-label={site.name}>
          <span className="relative grid size-10 place-items-center rounded-full bg-kairos-yellow shadow-[0_0_24px_-6px_var(--kairos-yellow)]">
            <Image
              src={logoSrc}
              alt=""
              width={40}
              height={40}
              unoptimized
              priority
              className="size-10 rounded-full"
            />
          </span>
          <span className="font-display text-base font-semibold tracking-tight">
            Excursão <span className="text-accent">Kairós</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden md:inline-flex">
            <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-4 top-[4.5rem] rounded-3xl border border-border bg-background/95 p-3 shadow-(--shadow) backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col" aria-label="Principal (mobile)">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base text-foreground/90 hover:bg-surface-hover"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild className="mt-2 w-full">
                <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Falar no WhatsApp
                </a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
