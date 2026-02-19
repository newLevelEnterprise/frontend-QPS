export interface ITurnosRegulares {
  id: number;
  turno:
    | "segunda"
    | "terca"
    | "quarta"
    | "quinta"
    | "sexta"
    | "sabado"
    | "domingo";
  manha: boolean;
  tarde: boolean;
  noite: boolean;
  frequencia: "diario" | "semanal" | "quinzenal" | "mensal" | "n/a";
}
