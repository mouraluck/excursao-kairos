import { SEAT_COUNT } from "@/lib/admin/schema";
import { logoSrc, site } from "@/lib/site";

// Desenha o mapa do ônibus direto em um canvas, em vez de fotografar a tela:
// o resultado sai nítido e igual em qualquer aparelho, e nada da interface
// (lista de passageiros, botões) entra na imagem.

const W = 1080;
const H = 1920;
const SCALE = 2;

const C = {
  bg: "#fbf9f2",
  ink: "#17171a",
  muted: "#4f4e48",
  line: "rgba(23,23,26,0.22)",
  card: "#fffefb",
  yellow: "#fff101",
  yellowDeep: "#e3d61d",
  gray: "#a1a1aa",
  grayDeep: "#71717a",
  accent: "#7a5a00",
};

export type BusCaptureInput = {
  tripName: string;
  /** Poltrona -> nome de quem está nela. */
  names: Record<number, string>;
  /** Escreve o primeiro nome nas poltronas ocupadas. */
  showNames: boolean;
};

function fonts() {
  const body = getComputedStyle(document.body).fontFamily || "sans-serif";
  return { body, display: `"Clash Display", ${body}` };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | [number, number, number, number],
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > max) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number) {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= max || !line) {
      line = next;
    } else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = fitText(ctx, `${kept[lines - 1]} ${out.slice(lines).join(" ")}`, max);
    return kept;
  }
  return out.map((l) => fitText(ctx, l, max));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderBusCapture(input: BusCaptureInput): Promise<Blob> {
  const { body, display } = fonts();
  await Promise.allSettled([
    document.fonts.load(`600 60px ${display}`),
    document.fonts.load(`600 30px ${body}`),
  ]);
  const logo = await loadImage(logoSrc);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const M = 64;

  /* Cabeçalho */
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(M + 44, 108, 44, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, M, 64, 88, 88);
    ctx.restore();
  }
  ctx.fillStyle = C.accent;
  ctx.font = `600 24px ${body}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("MAPA DO ÔNIBUS", M + 108, 98);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = C.muted;
  ctx.font = `500 28px ${body}`;
  ctx.fillText(site.name, M + 108, 138);

  ctx.fillStyle = C.ink;
  ctx.font = `600 64px ${display}`;
  const title = wrap(ctx, input.tripName, W - M * 2, 2);
  title.forEach((line, i) => ctx.fillText(line, M, 236 + i * 70));
  let y = 236 + (title.length - 1) * 70 + 44;

  /* Capacidade */
  const occupied = Object.keys(input.names).length;
  const stats = [
    { label: "Ocupadas", value: occupied, fill: C.card, stroke: C.line, ink: C.ink },
    { label: "Disponíveis", value: SEAT_COUNT - occupied, fill: C.yellow, stroke: C.yellowDeep, ink: C.ink },
    { label: "Total", value: SEAT_COUNT, fill: C.card, stroke: C.line, ink: C.ink },
  ];
  const gap = 20;
  const statW = (W - M * 2 - gap * 2) / 3;
  stats.forEach((s, i) => {
    const x = M + i * (statW + gap);
    roundRect(ctx, x, y, statW, 132, 24);
    ctx.fillStyle = s.fill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = s.stroke;
    ctx.stroke();
    ctx.fillStyle = s.ink === C.ink && s.fill === C.card ? C.muted : C.ink;
    ctx.font = `500 26px ${body}`;
    ctx.fillText(s.label, x + 26, y + 46);
    ctx.fillStyle = C.ink;
    ctx.font = `600 62px ${display}`;
    ctx.fillText(String(s.value), x + 26, y + 108);
  });
  y += 132 + 36;

  /* Ônibus */
  const seatW = 132;
  const seatH = 78;
  const seatGap = 14;
  const aisle = 84;
  const pad = 36;
  const front = 92;
  const rows = 12;
  const busW = pad * 2 + seatW * 4 + seatGap * 2 + aisle;
  const busH = front + rows * seatH + (rows - 1) * seatGap + pad * 2;
  const busX = (W - busW) / 2;

  roundRect(ctx, busX, y, busW, busH, [96, 96, 36, 36]);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.line;
  ctx.stroke();

  // Frente: motorista e porta
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(busX + pad + 30, y + 54, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = C.muted;
  ctx.beginPath();
  ctx.arc(busX + pad + 30, y + 54, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `600 20px ${body}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("MOTORISTA", busX + pad + 66, y + 61);
  ctx.textAlign = "right";
  ctx.fillText("PORTA", busX + busW - pad, y + 61);
  ctx.textAlign = "left";
  ctx.letterSpacing = "0px";
  ctx.setLineDash([10, 10]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.line;
  ctx.beginPath();
  ctx.moveTo(busX + pad, y + front);
  ctx.lineTo(busX + busW - pad, y + front);
  ctx.stroke();
  ctx.setLineDash([]);

  const colX = [
    busX + pad,
    busX + pad + seatW + seatGap,
    busX + pad + seatW * 2 + seatGap + aisle,
    busX + pad + seatW * 3 + seatGap * 2 + aisle,
  ];
  const rowY = (r: number) => y + front + pad + (r - 1) * (seatH + seatGap);

  function seat(n: number, x: number, sy: number) {
    const name = input.names[n];
    roundRect(ctx!, x, sy, seatW, seatH, [26, 26, 12, 12]);
    ctx!.fillStyle = name ? C.gray : C.yellow;
    ctx!.fill();
    ctx!.lineWidth = 3;
    ctx!.strokeStyle = name ? C.grayDeep : C.yellowDeep;
    ctx!.stroke();
    ctx!.textAlign = "center";
    ctx!.fillStyle = name ? "#ffffff" : C.ink;
    const withName = Boolean(name) && input.showNames;
    ctx!.font = `600 ${withName ? 32 : 38}px ${display}`;
    ctx!.fillText(String(n), x + seatW / 2, sy + (withName ? 38 : 52));
    if (withName) {
      ctx!.font = `500 19px ${body}`;
      const first = name.trim().split(/\s+/)[0] ?? "";
      ctx!.fillText(fitText(ctx!, first, seatW - 16), x + seatW / 2, sy + 63);
    }
    ctx!.textAlign = "left";
  }

  // Mesma numeração da tela: 1-2 à esquerda, 4-3 à direita; 45-46 e banheiro no fim.
  for (let r = 1; r <= 11; r++) {
    const sy = rowY(r);
    seat(4 * r - 3, colX[0], sy);
    seat(4 * r - 2, colX[1], sy);
    seat(4 * r, colX[2], sy);
    seat(4 * r - 1, colX[3], sy);
    ctx.fillStyle = "rgba(23,23,26,0.35)";
    ctx.font = `500 18px ${body}`;
    ctx.textAlign = "center";
    ctx.fillText(String(r), colX[1] + seatW + seatGap / 2 + aisle / 2 - seatGap / 2, sy + seatH / 2 + 6);
    ctx.textAlign = "left";
  }
  const lastY = rowY(12);
  seat(SEAT_COUNT - 1, colX[0], lastY);
  seat(SEAT_COUNT, colX[1], lastY);
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.line;
  roundRect(ctx, colX[2], lastY, seatW * 2 + seatGap, seatH, 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.muted;
  ctx.font = `600 20px ${body}`;
  ctx.letterSpacing = "3px";
  ctx.textAlign = "center";
  ctx.fillText("BANHEIRO", colX[2] + seatW + seatGap / 2, lastY + seatH / 2 + 7);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";

  y += busH + 44;

  /* Legenda e rodapé */
  const legend = [
    { label: "Disponível", fill: C.yellow, stroke: C.yellowDeep },
    { label: "Ocupada", fill: C.gray, stroke: C.grayDeep },
  ];
  ctx.font = `500 28px ${body}`;
  const widths = legend.map((l) => 34 + 14 + ctx.measureText(l.label).width);
  let lx = (W - (widths[0] + widths[1] + 56)) / 2;
  legend.forEach((l, i) => {
    roundRect(ctx, lx, y - 26, 34, 34, 8);
    ctx.fillStyle = l.fill;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = l.stroke;
    ctx.stroke();
    ctx.fillStyle = C.ink;
    ctx.fillText(l.label, lx + 48, y);
    lx += widths[i] + 56;
  });

  const now = new Date();
  const stamp = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  ctx.fillStyle = C.muted;
  ctx.font = `400 24px ${body}`;
  ctx.textAlign = "center";
  ctx.fillText(`Atualizado em ${stamp}`, W / 2, H - 56);
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem"))), "image/png");
  });
}
