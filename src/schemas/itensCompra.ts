import { z } from "zod";

export const criarItensCompraSchema = z.object({
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
  refugo: z.string().min(1, "Refugo é obrigatório"),
});

export const editarItensCompraSchema = z.object({
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.string().min(1, "Lead time é obrigatório"),
  custoMedio: z.string().min(1, "Custo médio é obrigatório"),
  refugo: z.string().min(1, "Refugo é obrigatório"),
});

export type IEditarItensCompraBody = z.infer<typeof editarItensCompraSchema>;

export type ICriarItensCompraBody = z.infer<typeof criarItensCompraSchema>;
