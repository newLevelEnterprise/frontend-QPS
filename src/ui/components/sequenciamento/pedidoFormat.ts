import type { IPedido } from "../../../types/Pedido";

export const PRIORIDADES = [1, 2, 3, 4, 9];
export const JOBS_SELECIONADOS_KEY = "jobs_para_sequenciamento";

export function readPedidosSelecionados(): IPedido[] {
  try {
    const raw = localStorage.getItem(JOBS_SELECIONADOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IPedido[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePedidosSelecionados(pedidos: IPedido[]) {
  localStorage.setItem(JOBS_SELECIONADOS_KEY, JSON.stringify(pedidos));
}

export function nomeCliente(pedido: IPedido) {
  return pedido.client?.name || pedido.product_name.split(" - ")[0] || "-";
}

export function nomeProduto(pedido: IPedido) {
  return (
    pedido.commercial_product?.name ||
    pedido.product?.name ||
    pedido.product_name.split(" - ").slice(1).join(" - ") ||
    pedido.product_name
  );
}

export function numeroPedido(pedido: IPedido) {
  return pedido.order_number || String(pedido.id);
}

export function prioridadePedido(pedido: IPedido): number | null {
  const value = pedido.priority ?? pedido.client?.priority ?? null;
  return value;
}

export function formatarNumero(value: number) {
  return Intl.NumberFormat("pt-BR").format(value);
}

export function formatarValor(value: number) {
  return Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function formatarData(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export function formatarHora(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(date);
}

export function dividirDataHora(value: string) {
  if (!value) return { date: "", time: "" };
  const [datePart, timePart] = value.split("T");
  if (datePart && timePart) {
    return { date: datePart.slice(0, 10), time: timePart.slice(0, 5) };
  }
  return { date: "", time: "" };
}

export function pedidoCombinaBusca(pedido: IPedido, busca: string) {
  if (!busca) return true;
  const texto = [
    pedido.product_name,
    pedido.order_number,
    nomeCliente(pedido),
    nomeProduto(pedido),
  ]
    .filter(Boolean)
    .join(" ");
  return texto.includes(busca);
}
