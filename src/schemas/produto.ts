import { z } from "zod";

export const criarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  refugo: z.string().max(100, 'Refugo deve ter no máximo 100').regex(/^\d+(\.\d{1,2})?$/, 'O regudo deve ser um número decimal'),
  ciclo: z.string(),
  bottleneck: z.string().optional(),
});



export const editarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  refugo: z.string().min(0, 'A quantidade de refugo deve ser no mínimo 0%').max(100, 'A quantidade de refugo deve ser no máximo 100%').regex(/^\d+(\.\d{1,2})?$/, 'O regudo deve ser um número decimal'),
  ciclo: z.string(),
  bottleneck: z.string(),
});

export type ICriarProdutoBody = z.infer<typeof criarProdutoSchema>;
export type IEditarProdutoBody = z.infer<typeof editarProdutoSchema>;