export interface ITurnosRegulares {
  id: number;
  dia_semana:
    | "Segunda-feira"
    | "Terça-feira"
    | "Quarta-feira"
    | "Quinta-feira"
    | "Sexta-feira"
    | "Sábado"
    | "Domingo";
  manha: boolean;
  tarde: boolean;
  noite: boolean;
  frequencia: "Diário" | "Semanal" | "Quinzenal" | "Mensal" | "Não Trabalha";
}
