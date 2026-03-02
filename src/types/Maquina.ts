export interface IMaquinas {
  id: number;
  name: string;
  produto: string;
  codMolde: string;
  disponibilidade: string | number;
}

export interface IMaquinasType {
  id: number;
  name: string;
  availability: string | number;
}

export interface ICompositionLineMachine {
  id: number;
  name: string;
  availability: number;
  cycle_time: number;
}

export interface ICompositionLineProductionLine {
  id: number;
  name: string;
}

export interface ICompositionLineMold {
  id: number;
  name: string;
  total_cavities: number;
  open_cavities: number;
  scrap: string;
  closed_cavity_risk: string;
}

export interface ICompositionLineProduct {
  id: number;
  name: string;
}

export interface ICompositionLine {
  production_line_id: number;
  mold_id: number;
  product_id: number;
  post_injection_cycle_time: number;
  id: number;
  production_line: ICompositionLineProductionLine;
  mold: ICompositionLineMold;
  product: ICompositionLineProduct;
  machines: ICompositionLineMachine[];
}
