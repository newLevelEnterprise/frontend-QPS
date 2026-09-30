import { z } from "zod";

export const criarInsumosSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
});

export const editarInsumosSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
});

export type IEditarInsumosBody = z.infer<typeof editarInsumosSchema>;

export type ICriarInsumosBody = z.infer<typeof criarInsumosSchema>;
