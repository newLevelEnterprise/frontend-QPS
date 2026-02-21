import { z } from "zod";

export const criarSequenciamentoInfoSchema = z.object({
  dataInicio: z.string().min(1, "Nome é obrigatório"),
  horarioInicio: z.number().min(0, "Lead time é obrigatório"),
  horarioLimite: z.number().min(0, "Custo médio é obrigatório"),
  sabadoTrabalha: z.boolean(),
});

export const editarSequenciamentoInfoSchema = z.object({
  dataInicio: z.string().min(1, "Nome é obrigatório"),
  horarioInicio: z.number().min(0, "Lead time é obrigatório"),
  horarioLimite: z.number().min(0, "Custo médio é obrigatório"),
  sabadoTrabalha: z.boolean(),
});

export type IEditarSequenciamentoInfoBody = z.infer<
  typeof editarSequenciamentoInfoSchema
>;

export type ICriarSequenciamentoInfoBody = z.infer<
  typeof criarSequenciamentoInfoSchema
>;
