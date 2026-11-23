"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetTitle,
} from "@/components/easyui/sheet";

const QUERY = "(min-width: 1024px)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true,
  );
}

/**
 * No computador, um painel ao lado (o mapa do ônibus continua clicável).
 * No celular, a folha da Easy UI que sobe de baixo e fecha arrastando.
 */
export function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const desktop = useIsDesktop();

  if (desktop) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-elevated">
        {children}
      </div>
    );
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" showClose={false} className="max-h-[92svh]">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetBody className="overflow-y-auto">
          <div className="px-5 pb-8 pt-1">{children}</div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
