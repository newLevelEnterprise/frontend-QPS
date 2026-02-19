import { z } from "zod";

export const turnosRegularesSchema = z.object({
  id: z.number().min(1, "ID é obrigatório"),
  turno: z.enum([
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ]),
  manha: z.boolean(),
  tarde: z.boolean(),
  noite: z.boolean(),
  frequencia: z.enum(["diario", "semanal", "quinzenal", "mensal", "n/a"]),
});

export type ITurnosRegularesBody = z.infer<typeof turnosRegularesSchema>;
