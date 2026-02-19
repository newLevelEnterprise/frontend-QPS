export interface IInsumos {
  id: number;
  material: string;
  unidade: "kg" | "g" | "un";
  leadTimeEntrega: number;
  custoMedio: number;
}
