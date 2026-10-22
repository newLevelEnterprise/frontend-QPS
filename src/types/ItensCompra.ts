export interface IItensCompra {
  name: string;
  lead_time: number;
  cost: number;
  scrap: number;
  id: number;
  external_id?: string | null;
  minimum_stock?: number;
}
