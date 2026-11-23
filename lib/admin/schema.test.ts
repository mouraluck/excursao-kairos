import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CURRENT_SCHEMA,
  NewerSchemaError,
  formatDocument,
  formatPhone,
  importTrip,
  isValidCpf,
  migrate,
  removePerson,
  upsertPerson,
} from "./schema.ts";

function env() {
  let n = 0;
  return { newId: () => `id-${++n}`, now: () => "2026-01-01T00:00:00.000Z" };
}

// Exatamente o formato que a primeira versão do painel gravava.
const V1 = [
  {
    id: "trip-a",
    name: "Ilhabela 29/11",
    createdAt: "2026-11-16T10:00:00.000Z",
    passengers: {
      5: { name: "Maria da Silva", document: "529.982.247-25", phone: "(11) 99999-0000", boarding: "Cotia" },
      6: { name: "João Souza", document: "", phone: "", boarding: "Barra Funda" },
      7: { name: "João Souza", document: "", phone: "", boarding: "Tiradentes" },
    },
  },
  {
    id: "trip-b",
    name: "São Thomé 19/12",
    createdAt: "2026-11-17T10:00:00.000Z",
    passengers: {
      1: { name: "MARIA DA SILVA", document: "52998224725", phone: "", boarding: "" },
      2: { name: "joão  souza", document: "", phone: "11988887777", boarding: "" },
    },
  },
];

test("v1 -> atual: nenhuma viagem nem poltrona se perde", () => {
  const { data, from } = migrate(structuredClone(V1), env());
  assert.equal(from, 1);
  assert.equal(data.schema, CURRENT_SCHEMA);
  assert.deepEqual(data.trips.map((t) => t.name), ["Ilhabela 29/11", "São Thomé 19/12"]);
  assert.deepEqual(Object.keys(data.trips[0].seats), ["5", "6", "7"]);
  assert.deepEqual(Object.keys(data.trips[1].seats), ["1", "2"]);
  assert.equal(data.trips[0].seats[5].boarding, "Cotia");
});

test("v1 -> atual: mesma pessoa em duas viagens vira um cadastro só", () => {
  const { data } = migrate(structuredClone(V1), env());
  const maria = data.people.filter((p) => p.document === "52998224725");
  assert.equal(maria.length, 1);
  assert.equal(maria[0].docType, "CPF");
  assert.equal(maria[0].phone, "11999990000");
  assert.equal(data.trips[0].seats[5].personId, data.trips[1].seats[1].personId);
});

test("v1 -> atual: homônimos no mesmo ônibus continuam em poltronas separadas", () => {
  const { data } = migrate(structuredClone(V1), env());
  const [a, b] = [data.trips[0].seats[6].personId, data.trips[0].seats[7].personId];
  assert.notEqual(a, b);
  assert.equal(data.people.length, 3);
});

test("dados já no formato atual passam sem mudar", () => {
  const first = migrate(structuredClone(V1), env()).data;
  const again = migrate(structuredClone(first), env());
  assert.equal(again.from, CURRENT_SCHEMA);
  assert.deepEqual(again.data, first);
});

test("navegador sem dados começa vazio", () => {
  assert.deepEqual(migrate(null, env()).data, { schema: CURRENT_SCHEMA, people: [], trips: [] });
});

test("dados de uma versão mais nova são recusados, não reescritos", () => {
  assert.throws(
    () => migrate({ schema: CURRENT_SCHEMA + 1, people: [], trips: [] }, env()),
    NewerSchemaError,
  );
});

test("documento formatado conforme o tipo e o tamanho", () => {
  assert.equal(formatDocument("CPF", "52998224725"), "529.982.247-25");
  assert.equal(formatDocument("CIN", "5299822"), "529.982.2");
  assert.equal(formatDocument("RG", "123456789"), "12.345.678-9");
  assert.equal(formatDocument("RG", "12345678x"), "12.345.678-X");
  assert.equal(formatDocument("RG", "12345678"), "1.234.567-8");
  assert.equal(formatDocument("RG", "mg12345678"), "MG12345678");
  assert.equal(isValidCpf("529.982.247-25"), true);
  assert.equal(isValidCpf("111.111.111-11"), false);
  assert.equal(formatPhone("11999990000"), "(11) 99999-0000");
  assert.equal(formatPhone("1133334444"), "(11) 3333-4444");
});

test("cadastro reaproveita a pessoa pelo documento e remove limpa as poltronas", () => {
  const e = env();
  const base = migrate(structuredClone(V1), e).data;
  const { people, personId } = upsertPerson(
    base.people,
    { name: "Maria S. Silva", docType: "CPF", document: "529.982.247-25", phone: "" },
    e,
  );
  assert.equal(people.length, base.people.length);
  assert.equal(people.find((p) => p.id === personId)?.name, "Maria S. Silva");
  const after = removePerson({ ...base, people }, personId);
  assert.equal(after.trips[0].seats[5], undefined);
  assert.equal(after.trips[1].seats[1], undefined);
});

test("importar planilha ocupa poltronas e move quem já estava no ônibus", () => {
  const e = env();
  const base = migrate(structuredClone(V1), e).data;
  const { data, stats } = importTrip(
    base,
    "trip-a",
    [
      { seat: 10, name: "Maria da Silva", document: "52998224725", phone: "", boarding: "Tiradentes" },
      { seat: 6, name: "Ana Lima", document: "", phone: "11977776666", boarding: "Cotia" },
      { name: "Sem Poltrona", document: "", phone: "", boarding: "" },
    ],
    e,
  );
  const trip = data.trips[0];
  assert.equal(trip.seats[5], undefined);
  assert.equal(trip.seats[10].boarding, "Tiradentes");
  assert.equal(data.people.find((p) => p.id === trip.seats[6].personId)?.name, "Ana Lima");
  assert.equal(data.people.find((p) => p.document === "52998224725")?.phone, "11999990000");
  assert.deepEqual(stats, { created: 2, updated: 1, seated: 2, replaced: 1 });
});
