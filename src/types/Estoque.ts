export interface IEstoqueInsumo {
  tipo: "materia_prima" | "item_compra";
  id_insumo: number;
  nome: string;
  quantidade_atual: number;
  estoque_minimo: number;
  ultima_atualizacao: string | null;
  source: string | null;
}

export interface IEstoqueNaoEncontrado {
  tipo: string;
  id_insumo: number;
}

export interface IEstoqueImportacao {
  linhas_processadas: number;
  linhas_atualizadas: number;
  linhas_com_erro: number;
  ids_nao_encontrados: IEstoqueNaoEncontrado[];
  erros: {
    linha?: number | null;
    tipo?: string | null;
    id_insumo?: number | null;
    motivo: string;
  }[];
}

export interface IEstoqueNwSync {
  configured: boolean;
  message: string;
  linhas_processadas: number;
  linhas_atualizadas: number;
  linhas_com_erro: number;
}
