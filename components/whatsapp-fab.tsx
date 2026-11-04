"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/icons";
import { site } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <motion.a
      href={site.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Excursão Kairós no WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-kairos-yellow text-kairos-black shadow-[0_10px_40px_-10px_var(--kairos-yellow)] md:bottom-8 md:right-8"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-kairos-yellow/60 animate-pulse-ring"
      />
      <WhatsAppIcon className="relative size-7" />
    </motion.a>
  );
}
