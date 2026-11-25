export const AJUSTE_DEMANDA_STORAGE_KEY = "ajuste_demanda";

export interface IDemandaComponentePreview {
  component_product_id: number;
  product_code: string | null;
  name: string;
  quantity_per_unit: number;
  initial_demand: number;
}

export interface IDemandaPedidoPreview {
  job_ids: number[];
  kind: "simple" | "compound";
  commercial_product_id: number;
  product_code: string | null;
  product_name: string;
  order_number: string | null;
  demand: number;
  components: IDemandaComponentePreview[];
}

export interface IComponenteAjuste extends IDemandaComponentePreview {
  fabricar: boolean;
  quantidade: string;
}

export interface IPedidoAjuste extends Omit<IDemandaPedidoPreview, "components"> {
  quantidade: string;
  componentes: IComponenteAjuste[];
}

export interface IAjusteDemanda {
  jobIds: number[];
  pedidos: IPedidoAjuste[];
}

export interface IFalhaAjuste {
  tipo: "composicao" | "quantidade" | "vazio";
  mensagem: string;
  pedido?: string;
  componente?: number;
}

export const pedidoKey = (pedido: { job_ids: number[] }) => pedido.job_ids.join("-");

export const campoKey = (pedido: string, componente?: number) =>
  componente === undefined ? pedido : `${pedido}:${componente}`;

export const mesmaSelecao = (
  ajuste: IAjusteDemanda | null | undefined,
  jobIds: number[],
): ajuste is IAjusteDemanda =>
  !!ajuste &&
  ajuste.jobIds.length === jobIds.length &&
  ajuste.jobIds.every((id, index) => id === jobIds[index]);

export const formatarQuantidade = (valor: number) => valor.toLocaleString("pt-BR");

export function quantidadeValida(valor: string) {
  const texto = valor.trim();
  if (!/^\d+$/.test(texto)) return false;
  const numero = Number(texto);
  return Number.isSafeInteger(numero) && numero > 0;
}

export function ordenarPedidos<T extends { kind: string }>(pedidos: T[]) {
  return [
    ...pedidos.filter((pedido) => pedido.kind === "compound"),
    ...pedidos.filter((pedido) => pedido.kind !== "compound"),
  ];
}

export function montarAjuste(
  preview: IDemandaPedidoPreview[],
  anteriores: IPedidoAjuste[] = [],
): IPedidoAjuste[] {
  const porPedido = new Map(anteriores.map((pedido) => [pedidoKey(pedido), pedido]));
  return ordenarPedidos(preview).map(({ components, ...pedido }) => {
    const anterior = porPedido.get(pedidoKey(pedido));
    const componentesAnteriores = new Map(
      (anterior?.componentes ?? []).map((componente) => [
        componente.component_product_id,
        componente,
      ]),
    );
    return {
      ...pedido,
      quantidade:
        pedido.kind === "simple"
          ? (anterior?.quantidade ?? String(pedido.demand))
          : String(pedido.demand),
      componentes: components.map((componente) => {
        const salvo = componentesAnteriores.get(componente.component_product_id);
        return {
          ...componente,
          fabricar: salvo?.fabricar ?? true,
          quantidade: salvo?.quantidade ?? String(componente.initial_demand),
        };
      }),
    };
  });
}

export function validarAjuste(pedidos: IPedidoAjuste[]): IFalhaAjuste | null {
  if (pedidos.length === 0) {
    return { tipo: "vazio", mensagem: "Nenhum item fabricável selecionado." };
  }
  for (const pedido of pedidos) {
    if (pedido.kind === "compound" && !pedido.componentes.some((item) => item.fabricar)) {
      return {
        tipo: "composicao",
        pedido: pedidoKey(pedido),
        mensagem: `Selecione pelo menos um componente do ${pedido.product_name}.`,
      };
    }
  }
  for (const pedido of pedidos) {
    if (pedido.kind === "simple") {
      if (!quantidadeValida(pedido.quantidade)) {
        return {
          tipo: "quantidade",
          pedido: pedidoKey(pedido),
          mensagem: `A quantidade de ${pedido.product_name} deve ser um número inteiro positivo.`,
        };
      }
      continue;
    }
    for (const componente of pedido.componentes) {
      if (componente.fabricar && !quantidadeValida(componente.quantidade)) {
        return {
          tipo: "quantidade",
          pedido: pedidoKey(pedido),
          componente: componente.component_product_id,
          mensagem: `A quantidade de ${componente.name} deve ser um número inteiro positivo.`,
        };
      }
    }
  }
  return null;
}

export function paraDemandAdjustments(pedidos: IPedidoAjuste[]) {
  return pedidos.map((pedido) =>
    pedido.kind === "simple"
      ? {
          job_ids: pedido.job_ids,
          commercial_product_id: pedido.commercial_product_id,
          quantity: Number(pedido.quantidade),
        }
      : {
          job_ids: pedido.job_ids,
          commercial_product_id: pedido.commercial_product_id,
          components: pedido.componentes.map((componente) => ({
            component_product_id: componente.component_product_id,
            manufacture: componente.fabricar,
            quantity: componente.fabricar ? Number(componente.quantidade) : null,
          })),
        },
  );
}

export function lerAjusteSalvo(raw: string | null): IAjusteDemanda | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.jobIds) || !Array.isArray(parsed?.pedidos)) return null;
    return parsed as IAjusteDemanda;
  } catch {
    return null;
  }
}
