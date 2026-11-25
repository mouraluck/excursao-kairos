"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Salva sozinho a edição de um registro que já existe: pouco depois de a
 * pessoa parar de digitar e também quando o formulário sai da tela (trocou
 * de passageiro, fechou, mudou de aba). `finish()` avisa que um botão já
 * resolveu (Salvar, Excluir), para não gravar de novo por cima.
 */
export function useAutosave({
  enabled,
  dirty,
  version,
  save,
  delay = 800,
}: {
  enabled: boolean;
  /** Há mudança válida ainda não gravada. */
  dirty: boolean;
  /** Muda a cada edição, para reiniciar a espera. */
  version: string;
  save: () => void;
  delay?: number;
}) {
  const latest = useRef({ pending: false, save, finished: false });
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    latest.current.pending = enabled && dirty;
    latest.current.save = save;
  });

  useEffect(() => {
    if (!enabled || !dirty) return;
    const timer = setTimeout(() => {
      if (latest.current.finished) return;
      latest.current.save();
      setSavedAt(Date.now());
    }, delay);
    return () => clearTimeout(timer);
  }, [enabled, dirty, version, delay]);

  useEffect(() => {
    const state = latest.current;
    return () => {
      if (state.pending && !state.finished) state.save();
    };
  }, []);

  const finish = useCallback(() => {
    latest.current.finished = true;
  }, []);

  return { finish, saved: savedAt > 0 && !dirty };
}
