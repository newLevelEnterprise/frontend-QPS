import { z } from "zod";

export const criarFeriadoSchema = z.object({
  dia: z.string().min(1, "Dia do feriado é obrigatório"),
  nome: z.string().min(1, "Nome do feriado é obrigatório"),
  tipo: z.string().min(1, "Tipo do feriado é obrigatório"),
});

export const editarFeriadoSchema = z.object({
  id: z.number().min(1, "ID é obrigatório"),
  dia: z.string().min(1, "Dia do feriado é obrigatório"),
  nome: z.string().min(1, "Nome do feriado é obrigatório"),
  tipo: z.string().min(1, "Tipo do feriado é obrigatório"),
});

export type IEditarFeriadoBody = z.infer<typeof editarFeriadoSchema>;

export type ICriarFeriadoBody = z.infer<typeof criarFeriadoSchema>;
