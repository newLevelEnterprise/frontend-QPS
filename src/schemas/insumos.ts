import { z } from "zod";

export const criarInsumosSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
});

export const editarInsumosSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
});

export type IEditarInsumosBody = z.infer<typeof editarInsumosSchema>;

export type ICriarInsumosBody = z.infer<typeof criarInsumosSchema>;
