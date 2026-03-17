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
  production_line: {
    id: number;
    name: string;
  };
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
  scrap: number;
  closed_cavity_risk: number;
}

export interface ICompositionLineProduct {
  id: number;
  name: string;
}

export interface ICompositionLine {
  production_line_id: number;
  mold_id: number;
  product_id: number;
  post_injection_cycle_time?: number;
  mold_name: string;
  product_name: string;
  id: number;
  mold: ICompositionLineMold;
  machines: ICompositionLineMachine[];
}
