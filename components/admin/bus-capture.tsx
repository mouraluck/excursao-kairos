"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Download, Share2 } from "lucide-react";
import { Button, Notice } from "@/components/admin/ui";
import { Switch } from "@/components/easyui/form";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/easyui/sheet";
import { renderBusCapture } from "@/lib/admin/bus-capture";
import { normalizeName } from "@/lib/admin/schema";

type Shot = { url: string; file: File };

/** Botão que gera a imagem do ônibus e abre a prévia para baixar ou compartilhar. */
export function BusCapture({
  tripName,
  names,
}: {
  tripName: string;
  names: Record<number, string>;
}) {
  const [open, setOpen] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lastUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    },
    [],
  );

  async function generate(withNames: boolean) {
    setBusy(true);
    setError("");
    try {
      const blob = await renderBusCapture({ tripName, names, showNames: withNames });
      const slug =
        normalizeName(tripName).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "viagem";
      const file = new File([blob], `onibus-${slug}.png`, { type: "image/png" });
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
      const url = URL.createObjectURL(blob);
      lastUrl.current = url;
      setShot({ url, file });
    } catch {
      setError("Não foi possível gerar a imagem neste navegador.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!shot) return;
    const a = document.createElement("a");
    a.href = shot.url;
    a.download = shot.file.name;
    a.click();
  }

  const canShare =
    shot !== null &&
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [shot.file] });

  async function share() {
    if (!shot) return;
    try {
      await navigator.share({ files: [shot.file], title: `Ônibus · ${tripName}` });
    } catch {
      /* a pessoa fechou o menu de compartilhar */
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
          void generate(showNames);
        }}
      >
        <Camera />
        Capturar ônibus
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[94svh]">
          <SheetBody className="overflow-y-auto">
            <div className="flex flex-col gap-4 px-5 pb-8 pt-1">
              <div>
                <SheetTitle className="font-display text-2xl font-semibold">
                  Captura do ônibus
                </SheetTitle>
                <SheetDescription className="text-base text-muted">
                  Só o mapa e a ocupação, sem a lista de passageiros.
                </SheetDescription>
              </div>

              <Switch
                checked={showNames}
                onChange={(checked) => {
                  setShowNames(checked);
                  void generate(checked);
                }}
                label="Mostrar nomes nas poltronas"
                description="Deixe desligado para enviar a clientes."
              />

              {error && <Notice tone="danger">{error}</Notice>}

              <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
                {shot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shot.url}
                    alt={`Mapa do ônibus da viagem ${tripName}`}
                    className={`mx-auto block max-h-[52svh] w-auto transition-opacity ${busy ? "opacity-50" : ""}`}
                  />
                ) : (
                  <p className="p-10 text-center text-base text-muted">
                    {busy ? "Gerando a imagem..." : "Sem imagem."}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="w-full" onClick={download} disabled={!shot || busy}>
                  <Download />
                  Baixar imagem
                </Button>
                {canShare && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => void share()}
                    disabled={busy}
                  >
                    <Share2 />
                    Compartilhar
                  </Button>
                )}
              </div>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
