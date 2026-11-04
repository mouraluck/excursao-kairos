export type Trip = {
  slug: string;
  destination: string;
  kind: string;
  date: string;
  weekday: string;
  summary: string;
  image: string;
  imageAlt: string;
  credit: { name: string; url: string };
  departures: { place: string; time: string }[];
  included: string[];
  price: { adult: number; child?: { value: number; ages: string } };
  deposit: number;
  banner?: string;
};

export const trips: Trip[] = [
  {
    slug: "ilhabela-29-11",
    destination: "Ilhabela",
    kind: "Bate-volta de ônibus",
    date: "29/11",
    weekday: "Domingo",
    summary:
      "Um domingo inteiro de praia no litoral norte, com saída na noite de sábado e tudo organizado para você só aproveitar.",
    image: "/viagens/ilhabela.jpg",
    imageAlt: "Baía de Ilhabela com barcos ancorados em mar azul-turquesa",
    credit: {
      name: "Ana Carolina / Unsplash",
      url: "https://unsplash.com/photos/C881R3PDtI4",
    },
    departures: [
      { place: "Cotia", time: "22:30" },
      { place: "Barra Funda", time: "23:30" },
      { place: "Tiradentes", time: "23:50" },
    ],
    included: [
      "Transporte ida e volta",
      "Lanche a bordo",
      "Água no ônibus",
      "Sorteio de brindes na volta",
    ],
    price: { adult: 200, child: { value: 180, ages: "5 a 10 anos" } },
    deposit: 70,
    banner: "/viagens/ilhabela-29-11.png",
  },
];

export function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}
