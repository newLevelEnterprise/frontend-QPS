import { z } from "zod";

export const criarItensCompraSchema = z.object({
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.number().min(0, "Custo médio é obrigatório"),
});

export const editarItensCompraSchema = z.object({
  item: z.string().min(1, "Nome é obrigatório"),
  leadTimeEntrega: z.number().min(0, "Lead time é obrigatório"),
  custoMedio: z.number().min(0, "Custo médio é obrigatório"),
});

export type IEditarItensCompraBody = z.infer<typeof editarItensCompraSchema>;

export type ICriarItensCompraBody = z.infer<typeof criarItensCompraSchema>;
