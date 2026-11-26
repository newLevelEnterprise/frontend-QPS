import assert from "node:assert/strict";
import { test } from "node:test";
import {
  estadosUtilizados,
  lerDesmarcadas,
  lerEstadosSalvos,
  marcarUtilizacao,
  maquinasUtilizadas,
  montarLinhas,
  paradasUtilizadas,
  salvarEstado,
  validarLinhas,
  type IEstadoMaquina,
  type IMaquinaSequenciamento,
} from "../src/ui/components/sequenciamento/steps/estadoMaquinas.ts";

const linha1 = { id: 1, name: "Linha 1" };
const maquinas: IMaquinaSequenciamento[] = [
  { id: 3, name: "Injetora 03", production_line: linha1 },
  { id: 1, name: "Injetora 01", production_line: linha1 },
  { id: 2, name: "Injetora 02", production_line: linha1 },
  { id: 4, name: "Injetora 04", production_line: linha1 },
];

const concluido = (maquina: number): IEstadoMaquina => ({
  production_line_id: "1",
  maquina: String(maquina),
  maquina_name: `Injetora 0${maquina}`,
  utilizacao: true,
  codMolde: "Molde Copo",
  prodMaquinaInicioSequenciamento: "Copo",
  status: "Concluido",
  numeroPedido: "",
  nome_cliente: "",
  tempoRestanteProdInjetora: "",
  tempoRestanteProdPosInjetora: "",
  demanda: "",
  valorAFAturar: "",
  dataLimiteFaturamento: "",
  horarioLimiteFaturamento: "",
});

const pendente = (maquina: number): IEstadoMaquina => ({
  ...concluido(maquina),
  status: "Não concluido",
  numeroPedido: "PED-7",
  nome_cliente: "Cliente A",
  tempoRestanteProdInjetora: "90",
  tempoRestanteProdPosInjetora: "30",
  demanda: "500",
  valorAFAturar: "1000",
  dataLimiteFaturamento: "2026-10-20",
  horarioLimiteFaturamento: "18:00",
});

const todosConfigurados = () => [1, 2, 3, 4].map(concluido);

test("todas as máquinas começam marcadas, sem estado e em ordem de nome", () => {
  const linhas = montarLinhas(maquinas, [], []);
  assert.deepEqual(linhas.map((linha) => linha.maquina.name), [
    "Injetora 01",
    "Injetora 02",
    "Injetora 03",
    "Injetora 04",
  ]);
  assert.ok(linhas.every((linha) => linha.utilizar && linha.estado === null));
});

test("todas as máquinas selecionadas e configuradas podem prosseguir", () => {
  const estados = todosConfigurados();
  assert.equal(validarLinhas(montarLinhas(maquinas, estados, [])), null);
  assert.deepEqual(maquinasUtilizadas(estados), [1, 2, 3, 4]);
});

test("seleção parcial envia só as máquinas marcadas", () => {
  const { estados, desmarcadas } = marcarUtilizacao(todosConfigurados(), [], 3, false);
  assert.deepEqual(desmarcadas, [3]);
  assert.equal(validarLinhas(montarLinhas(maquinas, estados, desmarcadas)), null);
  assert.deepEqual(maquinasUtilizadas(estados), [1, 2, 4]);
  assert.deepEqual(
    estadosUtilizados(estados).map((estado) => estado.maquina),
    ["1", "2", "4"],
  );
});

test("nenhuma máquina selecionada não prossegue", () => {
  const desmarcadas = [1, 2, 3, 4];
  assert.equal(
    validarLinhas(montarLinhas(maquinas, [], desmarcadas)),
    "Selecione pelo menos uma máquina.",
  );
});

test("máquina marcada sem estado pede configuração", () => {
  const estados = [concluido(1), concluido(2), concluido(4)];
  assert.equal(
    validarLinhas(montarLinhas(maquinas, estados, [])),
    "Configure o estado atual da máquina Injetora 03.",
  );
  assert.equal(validarLinhas(montarLinhas(maquinas, estados, [3])), null);
});

test("máquina marcada sem linha de produção não prossegue", () => {
  const semLinha = [...maquinas, { id: 5, name: "Injetora 05", production_line: null }];
  assert.equal(
    validarLinhas(montarLinhas(semLinha, todosConfigurados(), [])),
    "A máquina Injetora 05 não tem linha de produção.",
  );
  assert.equal(validarLinhas(montarLinhas(semLinha, todosConfigurados(), [5])), null);
});

test("desmarcar e marcar de novo preserva o estado configurado", () => {
  const configurados = [concluido(1), pendente(2)];
  const desligado = marcarUtilizacao(configurados, [], 2, false);
  const linhaDesligada = montarLinhas(maquinas, desligado.estados, desligado.desmarcadas)
    .find((linha) => linha.maquina.id === 2);
  assert.equal(linhaDesligada?.utilizar, false);
  assert.equal(linhaDesligada?.estado?.numeroPedido, "PED-7");
  assert.equal(linhaDesligada?.estado?.utilizacao, false);
  assert.deepEqual(maquinasUtilizadas(desligado.estados), [1]);

  const religado = marcarUtilizacao(desligado.estados, desligado.desmarcadas, 2, true);
  assert.deepEqual(religado.desmarcadas, []);
  assert.deepEqual(religado.estados[1], { ...pendente(2), utilizacao: true });
});

test("parada de máquina desmarcada não é enviada", () => {
  const paradas = [
    { id: 1, maquina: "1", motivo: "Manutenção" },
    { id: 2, maquina: "3", motivo: "Troca" },
  ];
  assert.deepEqual(
    paradasUtilizadas(paradas, [1, 2, 4]).map((parada) => parada.id),
    [1],
  );
});

test("status Concluído e Não concluído são guardados como informados", () => {
  const estados = salvarEstado(salvarEstado([], concluido(1)), pendente(2));
  assert.equal(estados[0].status, "Concluido");
  assert.equal(estados[0].numeroPedido, "");
  assert.equal(estados[1].status, "Não concluido");
  assert.equal(estados[1].tempoRestanteProdInjetora, "90");
  assert.equal(estados[1].horarioLimiteFaturamento, "18:00");
});

test("editar um estado salvo substitui o anterior sem duplicar a máquina", () => {
  const primeiro = salvarEstado([], concluido(2));
  const editado = salvarEstado(primeiro, pendente(2));
  assert.equal(editado.length, 1);
  assert.equal(editado[0].status, "Não concluido");
  const linha = montarLinhas(maquinas, editado, []).find((item) => item.maquina.id === 2);
  assert.equal(linha?.estado?.numeroPedido, "PED-7");
});

test("estados duplicados no armazenamento não chegam ao envio", () => {
  const duplicados = [concluido(1), pendente(1), concluido(2)];
  assert.deepEqual(
    estadosUtilizados(duplicados).map((estado) => estado.maquina),
    ["1", "2"],
  );
});

test("seleção e estados sobrevivem à ida e volta entre etapas", () => {
  const { estados, desmarcadas } = marcarUtilizacao(
    [concluido(1), pendente(2), concluido(3)],
    [],
    3,
    false,
  );
  const estadosLidos = lerEstadosSalvos(JSON.stringify(estados));
  const desmarcadasLidas = lerDesmarcadas(JSON.stringify(desmarcadas));
  assert.deepEqual(estadosLidos, estados);
  assert.deepEqual(desmarcadasLidas, [3]);
  const linhas = montarLinhas(maquinas, estadosLidos, desmarcadasLidas);
  assert.deepEqual(
    linhas.map((linha) => [linha.maquina.id, linha.utilizar, linha.estado?.status ?? null]),
    [
      [1, true, "Concluido"],
      [2, true, "Não concluido"],
      [3, false, "Concluido"],
      [4, true, null],
    ],
  );
});

test("armazenamento antigo ou inválido continua legível", () => {
  assert.deepEqual(lerEstadosSalvos(null), []);
  assert.deepEqual(lerEstadosSalvos("{quebrado"), []);
  assert.deepEqual(lerDesmarcadas('["x", 2]'), [2]);
  const antigo = JSON.stringify([concluido(1)]);
  assert.deepEqual(maquinasUtilizadas(lerEstadosSalvos(antigo)), [1]);
});
