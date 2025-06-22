import { z } from "zod";

export const criarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  refugo: z.string().max(100, 'Refugo deve ter no máximo 100'),
  ciclo: z.string(),
  bottleneck: z.string().optional(),
});



export const editarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  refugo: z.string(),
  ciclo: z.string(),
  bottleneck: z.string(),
});

export type ICriarProdutoBody = z.infer<typeof criarProdutoSchema>;
export type IEditarProdutoBody = z.infer<typeof editarProdutoSchema>;