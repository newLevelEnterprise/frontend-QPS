import type { ICriaStepsSequenciamentoBody } from "../../../../schemas/steps";

export const ESTADO_ATUAL_MAQUINA_STORAGE_KEY = "estado_atual_maquina";
export const MAQUINAS_DESMARCADAS_STORAGE_KEY = "maquinas_desmarcadas";

export type IEstadoMaquina =
  ICriaStepsSequenciamentoBody["estadoAtualMaquina"][number];

export interface IMaquinaSequenciamento {
  id: number;
  name: string;
  production_line?: { id: number; name: string } | null;
}

export interface ILinhaEstadoMaquina {
  maquina: IMaquinaSequenciamento;
  utilizar: boolean;
  estado: IEstadoMaquina | null;
}

const lerLista = (raw: string | null): unknown[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function lerEstadosSalvos(raw: string | null): IEstadoMaquina[] {
  return lerLista(raw).filter(
    (item): item is IEstadoMaquina =>
      !!item && typeof item === "object" && "maquina" in item,
  );
}

export function lerDesmarcadas(raw: string | null): number[] {
  return lerLista(raw).filter((id): id is number => Number.isInteger(id));
}

const mesmaMaquina = (estado: IEstadoMaquina, maquinaId: number) =>
  String(estado.maquina) === String(maquinaId);

export function montarLinhas(
  maquinas: IMaquinaSequenciamento[],
  estados: IEstadoMaquina[],
  desmarcadas: number[],
): ILinhaEstadoMaquina[] {
  return [...maquinas]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }))
    .map((maquina) => ({
      maquina,
      utilizar: !desmarcadas.includes(maquina.id),
      estado: estados.find((estado) => mesmaMaquina(estado, maquina.id)) ?? null,
    }));
}

export function salvarEstado(
  estados: IEstadoMaquina[],
  estado: IEstadoMaquina,
): IEstadoMaquina[] {
  const maquinaId = Number(estado.maquina);
  const salvo = { ...estado, utilizacao: true };
  return estados.some((atual) => mesmaMaquina(atual, maquinaId))
    ? estados.map((atual) => (mesmaMaquina(atual, maquinaId) ? salvo : atual))
    : [...estados, salvo];
}

export function marcarUtilizacao(
  estados: IEstadoMaquina[],
  desmarcadas: number[],
  maquinaId: number,
  utilizar: boolean,
) {
  return {
    estados: estados.map((estado) =>
      mesmaMaquina(estado, maquinaId) ? { ...estado, utilizacao: utilizar } : estado,
    ),
    desmarcadas: utilizar
      ? desmarcadas.filter((id) => id !== maquinaId)
      : desmarcadas.includes(maquinaId)
        ? desmarcadas
        : [...desmarcadas, maquinaId],
  };
}

export function validarLinhas(linhas: ILinhaEstadoMaquina[]): string | null {
  const selecionadas = linhas.filter((linha) => linha.utilizar);
  if (selecionadas.length === 0) {
    return "Selecione pelo menos uma máquina.";
  }
  const semLinha = selecionadas.find((linha) => !linha.maquina.production_line);
  if (semLinha) {
    return `A máquina ${semLinha.maquina.name} não tem linha de produção.`;
  }
  const semEstado = selecionadas.find((linha) => !linha.estado);
  if (semEstado) {
    return `Configure o estado atual da máquina ${semEstado.maquina.name}.`;
  }
  return null;
}

export function estadosUtilizados(estados: IEstadoMaquina[]): IEstadoMaquina[] {
  const vistos = new Set<string>();
  return estados.filter((estado) => {
    const chave = String(estado.maquina);
    if (!estado.utilizacao || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

export function maquinasUtilizadas(estados: IEstadoMaquina[]): number[] {
  return estadosUtilizados(estados).map((estado) => Number(estado.maquina));
}

export function paradasUtilizadas<T extends { maquina: string | number }>(
  paradas: T[],
  habilitadas: number[],
): T[] {
  return paradas.filter((parada) => habilitadas.includes(Number(parada.maquina)));
}
