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
  },
  {
    slug: "sao-thome-das-letras-19-20-12",
    destination: "São Thomé das Letras",
    kind: "Fim de semana com hospedagem",
    date: "19 e 20/12",
    weekday: "Sábado e domingo",
    summary:
      "Dois dias entre cachoeiras, mirantes e ruas de pedra na cidade mística de Minas, com hospedagem, guia local e transfer para os atrativos.",
    image: "/viagens/sao-thome.jpg",
    imageAlt:
      "Casas de pedra e rua de pedra são-tomé no centro de São Thomé das Letras",
    credit: {
      name: "Lucas Pezeta / Pexels",
      url: "https://www.pexels.com/photo/2353120/",
    },
    departureNote: "Sexta, 18/12",
    departures: [
      { place: "Cotia", time: "22:00" },
      { place: "Barra Funda", time: "23:00" },
      { place: "Tiradentes", time: "23:30" },
    ],
    included: [
      "Ônibus executivo",
      "Hospedagem (1 noite)",
      "2 cafés da manhã",
      "Guia local",
      "Transfer para os atrativos",
      "Seguro viagem",
      "Lanche na ida",
      "Sorteio na volta",
    ],
    price: {
      adult: 550,
      from: true,
      child: { value: 505, ages: "5 a 12 anos", note: "acompanhadas" },
    },
    rooms: [
      { label: "Casal ou duplo", value: 590 },
      { label: "Triplo", value: 570 },
      { label: "Quádruplo", value: 550 },
    ],
    payment: "Pix ou parcelado no cartão (com taxa da operadora)",
    schedule: [
      { label: "Chegada em São Thomé", value: "sáb. 19/12, por volta das 7h" },
      { label: "Retorno", value: "dom. 20/12, às 16h" },
      { label: "Chegada em São Paulo", value: "dom. 20/12, por volta das 22h30" },
    ],
    itinerary: [
      {
        day: "Sábado, 19/12",
        items: [
          "Chegada, check-in e café da manhã",
          "Saída para os atrativos, com almoço no percurso",
          "Pôr do sol e tempo livre",
        ],
      },
      {
        day: "Domingo, 20/12",
        items: [
          "Café da manhã",
          "Tour pelo centro de São Thomé",
          "Retorno para São Paulo",
        ],
      },
    ],
    notIncluded: ["Ingressos dos passeios", "Almoço"],
    deposit: 100,
    whatsappMessage:
      "Olá! Quero reservar minha vaga na viagem para São Thomé das Letras, dias 19 e 20/12.",
    banner: "/viagens/sao-thome-19-20-12.png",
  },
];

export function formatBRL(value: number) {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}
