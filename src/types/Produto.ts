export interface IProduto {
  name: string;
  scrap: number;
  cycle: number;
  bottleneck: number;
  id: number;
}

export interface IProdutoSetup {
  ciclo: number;
  nomeProdutoOrigem: string;
  nomeProdutoDestino: string;
  produto_de: number
  produto_para: number
  tempo_setup: number
  menor_produto: number
  maior_produto: number
  id: number
}
