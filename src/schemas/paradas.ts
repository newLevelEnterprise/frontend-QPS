import { z } from "zod";

export const criarParadaSchema = z.object({
  motivo: z.string().min(1, "Produto é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  horaInicio: z.string().min(1, "Hora de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  horaFim: z.string().min(1, "Hora de fim é obrigatória"),
  maquina: z.string().min(1, "Máquina é obrigatória"),
});

export const editarParadaSchema = z.object({
  id: z.number().min(1, "ID é obrigatório"),
  motivo: z.string().min(1, "Produto é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  horaInicio: z.string().min(1, "Hora de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  horaFim: z.string().min(1, "Hora de fim é obrigatória"),
  maquina: z.string().min(1, "Máquina é obrigatória"),
});

export type IEditarParadaBody = z.infer<typeof editarParadaSchema>;

export type ICriarParadaBody = z.infer<typeof criarParadaSchema>;
