import { z } from "zod";

export const criarFeriadoSchema = z.object({
  date: z.string().min(1, "Dia do feriado é obrigatório"),
  name: z.string().min(1, "Nome do feriado é obrigatório"),
  level: z.string().min(1, "Nível do feriado é obrigatório"),
  city: z.string().min(1, "Cidade do feriado é obrigatória"),
  state: z.string().min(1, "Estado do feriado é obrigatório"),
});

export const editarFeriadoSchema = z.object({
  id: z.number().min(1, "ID é obrigatório"),
  date: z.string().min(1, "Dia do feriado é obrigatório"),
  name: z.string().min(1, "Nome do feriado é obrigatório"),
  level: z.string().min(1, "Nível do feriado é obrigatório"),
  city: z.string().min(1, "Cidade do feriado é obrigatória"),
  state: z.string().min(1, "Estado do feriado é obrigatório"),
});

export type IEditarFeriadoBody = z.infer<typeof editarFeriadoSchema>;

export type ICriarFeriadoBody = z.infer<typeof criarFeriadoSchema>;
