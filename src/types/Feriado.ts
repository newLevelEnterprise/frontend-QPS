export interface IFeriado {
  id: number;
  dia: string;
  nome: string;
  tipo: string;
}

export interface IFeriadoType {
  name: string;
  date: string;
  level: string;
  id: number;
  type?: string;
  production_line_id?: number | null;
}
