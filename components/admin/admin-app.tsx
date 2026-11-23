"use client";

import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import {
  BusFront,
  Download,
  LockKeyhole,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { PeoplePage } from "@/components/admin/people-page";
import { TripView } from "@/components/admin/trip-view";
import { Button, Input, Notice } from "@/components/admin/ui";
import { AnimatedTabs } from "@/components/easyui/animated-tabs";
import { UndoToast } from "@/components/easyui/undo-toast";
import { deriveDataKey, deriveVerifier } from "@/lib/admin/crypto";
import {
  type AdminData,
  CURRENT_SCHEMA,
  SEAT_COUNT,
  emptyData,
  occupiedCount,
} from "@/lib/admin/schema";
import { env, loadData, parseBackup, saveData } from "@/lib/admin/store";
import { logoSrc, site } from "@/lib/site";

const VERIFIER = process.env.NEXT_PUBLIC_ADMIN_VERIFIER ?? "";

// Em nenhum destes casos o painel escreve por cima do que está salvo.
const LOAD_ERRORS = {
  undecryptable:
    "Há dados neste navegador salvos com outra senha. Entre com a senha antiga para exportar o backup antes de trocar.",
  newer:
    "Os dados deste navegador foram salvos por uma versão mais nova do painel. Recarregue a página para atualizar e tente de novo.",
  invalid:
    "Os dados salvos neste navegador não puderam ser lidos. Nada foi alterado. Importe um backup ou fale com o suporte.",
} as const;

/* ------------------------------- Login ------------------------------- */

function Login({
  onLogin,
}: {
  onLogin: (key: CryptoKey, data: AdminData, migratedFrom?: number) => void;
}) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const verifier = await deriveVerifier(login, password);
      if (verifier !== VERIFIER) {
        setError("Login ou senha incorretos.");
        return;
      }
      const key = await deriveDataKey(login, password);
      const result = await loadData(key);
      if (!result.ok) {
        setError(LOAD_ERRORS[result.reason]);
        return;
      }
      onLogin(key, result.data, result.migratedFrom);
    } catch {
      setError("Não foi possível entrar neste navegador.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-surface p-8 shadow-(--shadow)">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src={logoSrc}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="size-14 rounded-full"
          />
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">
              Painel da {site.name}
            </h1>
            <p className="text-sm text-muted">Viagens e passageiros</p>
          </div>
        </div>

        {!VERIFIER ? (
          <p className="rounded-2xl border border-border bg-surface-inset p-4 text-base text-muted">
            O painel ainda não foi configurado. Defina os secrets{" "}
            <code className="font-semibold text-foreground">ADMIN_LOGIN</code> e{" "}
            <code className="font-semibold text-foreground">ADMIN_PASSWORD</code>{" "}
            no repositório e publique de novo.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Login</span>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Senha</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                showPasswordToggle
                required
              />
            </label>
            {error && (
              <Notice tone="danger">{error}</Notice>
            )}
            <Button type="submit" size="lg" isLoading={busy} loadingText="Entrando..." className="w-full">
              <LockKeyhole />
              Entrar
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

/* --------------------------- Lista de viagens --------------------------- */

function TripList({
  data,
  notice,
  onOpen,
  onChange,
}: {
  data: AdminData;
  notice: string;
  onOpen: (id: string) => void;
  onChange: OnChange;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState(notice);
  const fileRef = useRef<HTMLInputElement>(null);
  const { trips } = data;

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onChange({
      ...data,
      trips: [
        ...trips,
        { id: env.newId(), name: name.trim(), createdAt: env.now(), seats: {} },
      ],
    });
    setName("");
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kairos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importBackup(file: File) {
    const parsed = parseBackup(await file.text());
    if (!parsed) {
      setMessage("Esse arquivo não é um backup válido do painel.");
      return;
    }
    const has = trips.length > 0 || data.people.length > 0;
    if (
      has &&
      !window.confirm(
        `Substituir tudo o que está neste navegador (${trips.length} viagens, ${data.people.length} passageiros) pelo backup (${parsed.trips.length} viagens, ${parsed.people.length} passageiros)?`,
      )
    ) {
      return;
    }
    onChange(parsed);
    setMessage(
      `Backup importado: ${parsed.trips.length} viagens e ${parsed.people.length} passageiros.`,
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Painel
        </p>
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Viagens
        </h1>
      </div>

      {message && (
        <Notice tone="info" className="mb-6">{message}</Notice>
      )}

      <form
        onSubmit={add}
        className="mb-8 flex flex-col gap-3 rounded-[2rem] border border-border bg-surface p-5 shadow-(--shadow) sm:flex-row sm:items-end sm:p-6"
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-semibold">Nome da nova viagem</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Ilhabela 29/11"
          />
        </label>
        <Button type="submit" size="lg" className="h-12" disabled={!name.trim()}>
          <Plus />
          Adicionar viagem
        </Button>
      </form>

      {trips.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-lg text-muted">
          Nenhuma viagem cadastrada. Adicione a primeira acima.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trips.map((trip) => {
            const occupied = occupiedCount(trip);
            return (
              <li
                key={trip.id}
                className="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-surface p-5 shadow-(--shadow)"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold leading-tight">
                    {trip.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir a viagem ${trip.name}`}
                    className="shrink-0 text-muted hover:text-red-600"
                    onClick={() => {
                      onChange(
                        { ...data, trips: trips.filter((t) => t.id !== trip.id) },
                        {
                          title: `Viagem "${trip.name}" excluída`,
                          description: "Os passageiros continuam no cadastro.",
                        },
                      );
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-sm text-muted">
                    <span>
                      <strong className="text-foreground">{occupied}</strong> de {SEAT_COUNT}{" "}
                      poltronas
                    </span>
                    <span>{SEAT_COUNT - occupied} livres</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-kairos-yellow">
                    <div
                      className="h-full rounded-full bg-zinc-400"
                      style={{ width: `${(occupied / SEAT_COUNT) * 100}%` }}
                    />
                  </div>
                </div>
                <Button onClick={() => onOpen(trip.id)} size="lg" className="w-full">
                  <BusFront />
                  Abrir ônibus
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 rounded-2xl border border-border bg-surface-inset p-5">
        <h2 className="mb-1 text-base font-semibold">Backup completo</h2>
        <p className="mb-4 text-sm text-muted">
          Viagens e passageiros ficam guardados só neste navegador, protegidos
          pela senha. Atualizações do site não apagam esses dados. Exporte um
          backup de vez em quando e para levar a outro aparelho.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={exportBackup}
            disabled={trips.length === 0 && data.people.length === 0}
          >
            <Download />
            Exportar backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload />
            Importar backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importBackup(file);
              e.target.value = "";
            }}
          />
        </div>
        <p className="mt-4 text-xs text-muted">
          Formato dos dados: versão {CURRENT_SCHEMA}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------- Painel -------------------------------- */

type Page = "trips" | "people";

type UndoInfo = { title: string; description?: string };

/** Grava os dados. Com `undo`, mostra um aviso com o botão Desfazer. */
export type OnChange = (data: AdminData, undo?: UndoInfo) => void;

export function AdminApp() {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [data, setData] = useState<AdminData>(emptyData);
  const [page, setPage] = useState<Page>("trips");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [undo, setUndo] = useState<(UndoInfo & { id: number; prev: AdminData }) | null>(null);

  function persist(next: AdminData) {
    setData(next);
    if (key) void saveData(key, next);
  }

  // Desfazer volta ao estado de antes da ação; qualquer mudança posterior o descarta.
  const commit: OnChange = (next, info) => {
    setUndo(info ? { ...info, id: Date.now(), prev: data } : null);
    persist(next);
  };

  if (!key) {
    return (
      <Login
        onLogin={(k, loaded, migratedFrom) => {
          setKey(k);
          setData(loaded);
          setNotice(
            migratedFrom
              ? "O painel foi atualizado e seus dados foram convertidos para a nova versão. Nada foi perdido: os passageiros de cada viagem agora também aparecem na aba Passageiros."
              : "",
          );
        }}
      />
    );
  }

  const open = page === "trips" ? data.trips.find((t) => t.id === openId) : undefined;

  const tabs: { id: Page; label: string; icon: typeof BusFront }[] = [
    { id: "trips", label: "Viagens", icon: BusFront },
    { id: "people", label: "Passageiros", icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Image
              src={logoSrc}
              alt={site.name}
              width={40}
              height={40}
              unoptimized
              className="size-10 shrink-0 rounded-full"
            />
            <AnimatedTabs
              variant="pill"
              renderContent={false}
              activeTab={page}
              onChange={(id) => {
                setPage(id as Page);
                setOpenId(null);
              }}
              tabs={tabs.map((tab) => ({
                id: tab.id,
                label: tab.label,
                icon: <tab.icon className="size-4" />,
              }))}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setKey(null);
              setUndo(null);
              setData(emptyData());
              setOpenId(null);
              setPage("trips");
            }}
          >
            <LogOut />
            Sair
          </Button>
        </div>
      </header>

      {page === "people" ? (
        <PeoplePage data={data} onChange={commit} />
      ) : open ? (
        <TripView
          data={data}
          trip={open}
          onChange={commit}
          onBack={() => setOpenId(null)}
        />
      ) : (
        <TripList data={data} notice={notice} onOpen={setOpenId} onChange={commit} />
      )}

      {undo && (
        <div className="print:hidden">
          <UndoToast
            key={undo.id}
            open
            title={undo.title}
            description={undo.description}
            undoLabel="Desfazer"
            restoredMessage="Restaurado"
            duration={8000}
            position="bottom-center"
            onUndo={() => persist(undo.prev)}
            onDismiss={() => setUndo(null)}
          />
        </div>
      )}
    </>
  );
}
