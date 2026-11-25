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
  /** Texto acima das saídas quando o embarque é em outro dia. */
  departureNote?: string;
  departures: { place: string; time: string }[];
  included: string[];
  price: {
    adult: number;
    /** true quando o valor do adulto é "a partir de". */
    from?: boolean;
    child?: { value: number; ages: string; note?: string };
  };
  /** Valores por pessoa conforme o tipo de quarto. */
  rooms?: { label: string; value: number }[];
  payment?: string;
  /** Horários previstos de chegada e retorno. */
  schedule?: { label: string; value: string }[];
  itinerary?: { day: string; items: string[] }[];
  notIncluded?: string[];
  deposit: number;
  /** Mensagem que abre no WhatsApp ao reservar esta viagem. */
  whatsappMessage: string;
  banner?: string;
  /** Sem vagas: mostra a faixa "Esgotado" e troca a reserva por lista de espera. */
  soldOut?: boolean;
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
    whatsappMessage:
      "Olá! Quero reservar minha vaga na viagem para Ilhabela, domingo 29/11.",
    banner: "/viagens/ilhabela-29-11.png",
    soldOut: true,
  },
  {
    slug: "rancho-do-ze-joao-30-01",
    destination: "Rancho do Zé João",
    kind: "Day use · bate-volta de ônibus",
    date: "30/01",
    weekday: "Sábado",
    summary:
      "Um dia inteiro no rancho em Lavrinhas (SP), aos pés da Mantiqueira, com piscinas naturais e rio de serra. Saída cedo no sábado e tudo organizado para você só aproveitar.",
    image: "/viagens/rancho-ze-joao.jpg",
    imageAlt: "Piscina natural de água transparente com deck de madeira, cercada de mata",
    credit: {
      name: "Imagem ilustrativa · Thiago Zanutim Lucas / Pexels",
      url: "https://www.pexels.com/photo/13424408/",
    },
    departures: [
      { place: "Cotia", time: "4:00" },
      { place: "Barra Funda", time: "5:00" },
      { place: "Tiradentes", time: "5:30" },
      { place: "Arujá (retorno)", time: "6:30" },
    ],
    included: ["Ônibus executivo", "Kit lanche", "Sorteio de brindes na volta"],
    price: { adult: 195, child: { value: 165, ages: "6 a 11 anos" } },
    payment: "Pix ou parcelado no cartão (com taxa da operadora)",
    deposit: 70,
    whatsappMessage:
      "Olá! Quero reservar minha vaga na viagem para o Rancho do Zé João, sábado 30/01.",
    banner: "/viagens/rancho-ze-joao-30-01.jpg",
  },
];

export function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}
