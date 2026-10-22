import { z } from "zod";

export const criarItensCompraSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
  refugo: z.string().min(1, "Refugo é obrigatório"),
  estoqueMinimo: z
    .string()
    .min(1, "Estoque mínimo é obrigatório")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    }, "Estoque mínimo deve ser um número maior ou igual a zero"),
});

export const editarItensCompraSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
  refugo: z.string().min(1, "Refugo é obrigatório"),
  estoqueMinimo: z
    .string()
    .min(1, "Estoque mínimo é obrigatório")
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= 0;
    }, "Estoque mínimo deve ser um número maior ou igual a zero"),
});

export type IEditarItensCompraBody = z.infer<typeof editarItensCompraSchema>;

export type ICriarItensCompraBody = z.infer<typeof criarItensCompraSchema>;
