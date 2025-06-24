export interface IProduto {
  name: string;
  scrap: number;
  cycle: number;
  bottleneck: number;
  id: number;
}

export interface IProdutoSetup {
  nomeProdutoDestino: string;
  tempo_setup: number
  id: number
}
