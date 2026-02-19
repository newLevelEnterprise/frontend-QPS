import { z } from "zod";

export const criarInsumosSchema = z.object({
  material: z.string().min(1, "Nome é obrigatório"),
  unidade: z.enum(["kg", "g", "un"]),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.number().min(0, "Custo médio é obrigatório"),
});

export const editarInsumosSchema = z.object({
  material: z.string().min(1, "Nome é obrigatório"),
  unidade: z.enum(["kg", "g", "un"]),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.number().min(0, "Custo médio é obrigatório"),
});

export type IEditarInsumosBody = z.infer<typeof editarInsumosSchema>;

export type ICriarInsumosBody = z.infer<typeof criarInsumosSchema>;
