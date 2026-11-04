export const site = {
  name: "Excursão Kairós",
  tagline: "Viagens em grupo no tempo certo.",
  owner: "Analice Moura",
  whatsappUrl:
    "https://wa.me/5511993608627?text=Ol%C3%A1%21%20Gostaria%20de%20saber%20mais%20sobre%20as%20pr%C3%B3ximas%20viagens%20da%20Excurs%C3%A3o%20Kair%C3%B3s",
  instagramUrl: "https://www.instagram.com/excursoeskairos/",
  instagramHandle: "@excursoeskairos",
} as const;

export const nav = [
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "Roteiros", href: "#roteiros" },
  { label: "Contato", href: "#contato" },
] as const;

// Imagens com `unoptimized` não recebem o basePath automaticamente.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const logoSrc = `${basePath}/logo.svg`;
