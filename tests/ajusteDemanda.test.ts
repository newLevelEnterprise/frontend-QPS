import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lerAjusteSalvo,
  mesmaSelecao,
  montarAjuste,
  paraDemandAdjustments,
  validarAjuste,
  type IDemandaPedidoPreview,
} from "../src/ui/components/sequenciamento/steps/ajusteDemanda.ts";

const simples: IDemandaPedidoPreview = {
  job_ids: [1],
  kind: "simple",
  commercial_product_id: 10,
  product_code: "S-10",
  product_name: "Tampa",
  order_number: "P-1",
  demand: 1000,
  components: [],
};

const composto: IDemandaPedidoPreview = {
  job_ids: [2],
  kind: "compound",
  commercial_product_id: 20,
  product_code: "C-20",
  product_name: "Kit",
  order_number: "P-2",
  demand: 1000,
  components: [
    {
      component_product_id: 21,
      product_code: "A",
      name: "Componente A",
      quantity_per_unit: 1,
      initial_demand: 1000,
    },
    {
      component_product_id: 22,
      product_code: "B",
      name: "Componente B",
      quantity_per_unit: 2,
      initial_demand: 2000,
    },
  ],
};

test("compostos aparecem antes dos simples", () => {
  const pedidos = montarAjuste([simples, composto]);
  assert.deepEqual(
    pedidos.map((pedido) => pedido.kind),
    ["compound", "simple"],
  );
});

test("quantidade inicial vem da demanda e componentes começam marcados", () => {
  const [kit, tampa] = montarAjuste([simples, composto]);
  assert.equal(tampa.quantidade, "1000");
  assert.equal(kit.quantidade, "1000");
  assert.deepEqual(
    kit.componentes.map((item) => [item.fabricar, item.quantidade]),
    [
      [true, "1000"],
      [true, "2000"],
    ],
  );
});

test("ajustes sobrevivem ao recarregar a etapa", () => {
  const [kit, tampa] = montarAjuste([simples, composto]);
  const editados = [
    {
      ...kit,
      quantidade: "999",
      componentes: [
        { ...kit.componentes[0], fabricar: false, quantidade: "700" },
        { ...kit.componentes[1], quantidade: "2500" },
      ],
    },
    { ...tampa, quantidade: "1200" },
  ];
  const salvo = lerAjusteSalvo(JSON.stringify({ jobIds: [1, 2], pedidos: editados }));
  assert.ok(salvo);
  const [kit2, tampa2] = montarAjuste([simples, composto], salvo.pedidos);
  assert.equal(tampa2.quantidade, "1200");
  assert.equal(kit2.quantidade, "1000");
  assert.deepEqual(
    kit2.componentes.map((item) => [item.fabricar, item.quantidade]),
    [
      [false, "700"],
      [true, "2500"],
    ],
  );
});

test("ajuste salvo só vale para a mesma seleção de pedidos", () => {
  const ajuste = { jobIds: [1, 2], pedidos: montarAjuste([simples, composto]) };
  assert.equal(mesmaSelecao(ajuste, [1, 2]), true);
  assert.equal(mesmaSelecao(ajuste, [1, 3]), false);
  assert.equal(mesmaSelecao(ajuste, [1]), false);
  assert.equal(mesmaSelecao(null, [1, 2]), false);
  assert.equal(lerAjusteSalvo("{inválido"), null);
});

test("payload envia desmarcado sem quantidade e não reenvia comercial do composto", () => {
  const [kit, tampa] = montarAjuste([simples, composto]);
  const payload = paraDemandAdjustments([
    {
      ...kit,
      componentes: [
        { ...kit.componentes[0], fabricar: false, quantidade: "700" },
        { ...kit.componentes[1], quantidade: "2500" },
      ],
    },
    { ...tampa, quantidade: "1200" },
  ]);
  assert.deepEqual(payload, [
    {
      job_ids: [2],
      commercial_product_id: 20,
      components: [
        { component_product_id: 21, manufacture: false, quantity: null },
        { component_product_id: 22, manufacture: true, quantity: 2500 },
      ],
    },
    { job_ids: [1], commercial_product_id: 10, quantity: 1200 },
  ]);
});

test("composto exige pelo menos um componente marcado", () => {
  const [kit, tampa] = montarAjuste([simples, composto]);
  const falha = validarAjuste([
    { ...kit, componentes: kit.componentes.map((item) => ({ ...item, fabricar: false })) },
    tampa,
  ]);
  assert.equal(falha?.tipo, "composicao");
  assert.equal(falha?.mensagem, "Selecione pelo menos um componente do Kit.");
});

test("quantidades precisam ser inteiras e positivas", () => {
  const [kit, tampa] = montarAjuste([simples, composto]);
  for (const valor of ["", "0", "-5", "1.5", "abc"]) {
    assert.equal(validarAjuste([kit, { ...tampa, quantidade: valor }])?.tipo, "quantidade");
  }
  const componenteInvalido = validarAjuste([
    {
      ...kit,
      componentes: [kit.componentes[0], { ...kit.componentes[1], quantidade: "0" }],
    },
  ]);
  assert.equal(componenteInvalido?.componente, 22);
});

test("componente desmarcado não é validado e mantém o valor", () => {
  const [kit] = montarAjuste([composto]);
  const pedidos = [
    {
      ...kit,
      componentes: [kit.componentes[0], { ...kit.componentes[1], fabricar: false, quantidade: "" }],
    },
  ];
  assert.equal(validarAjuste(pedidos), null);
  assert.equal(pedidos[0].componentes[1].quantidade, "");
  assert.equal(validarAjuste([])?.tipo, "vazio");
});
