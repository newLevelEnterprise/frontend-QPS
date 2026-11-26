import { z } from "zod";

export const NIVEIS_FERIADO = [
  "Nacional",
  "Estadual",
  "Regional",
  "Municipal",
  "Pausa",
] as const;

export const criarFeriadoSchema = z.object({
  date: z.string().min(1, "Dia do feriado é obrigatório"),
  name: z.string().trim().min(1, "Informe o nome.").max(120),
  level: z.string().min(1, "Nível do feriado é obrigatório"),
});

export const editarFeriadoSchema = criarFeriadoSchema.extend({
  id: z.number().min(1, "ID é obrigatório"),
});

export type IEditarFeriadoBody = z.infer<typeof editarFeriadoSchema>;

export type ICriarFeriadoBody = z.infer<typeof criarFeriadoSchema>;
