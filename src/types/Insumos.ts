export interface IInsumos {
  id: number;
  external_id?: string | null;
  material: string;
  leadTimeEntrega: number;
  custoMedio: number;
  minimum_stock?: number;
}
