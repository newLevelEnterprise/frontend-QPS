export interface IMoldes {
  id: number;
  name: string;
  products: { id: number; name: string }[];
  total_cavities: number;
  open_cavities: number;
  scrap: number | string;
  closed_cavity_risk: number | string;
}
