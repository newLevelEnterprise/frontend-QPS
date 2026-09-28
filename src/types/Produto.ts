export interface IProductStructureComponent {
  id: number;
  external_id?: string | null;
  name: string;
  quantity: number;
}

export interface IProduto {
  name: string;
  id: number;
  external_id?: string | null;
  post_injection_cycle_time?: number;
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
