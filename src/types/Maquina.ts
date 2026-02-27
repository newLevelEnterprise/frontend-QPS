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
