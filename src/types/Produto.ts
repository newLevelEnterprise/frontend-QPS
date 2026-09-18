export interface IProductStructureComponent {
  id: number;
  name: string;
  quantity: number;
}

export interface IProduto {
  name: string;
  id: number;
  scrap?: number;
  cycle?: number;
  bottleneck?: number;
  is_simple?: boolean;
  structure_components?: IProductStructureComponent[];
}

export interface IProdutoSetup {
  nomeProdutoDestino: string;
  tempo_setup: number;
  id: number;
  setup_id: number;
}
