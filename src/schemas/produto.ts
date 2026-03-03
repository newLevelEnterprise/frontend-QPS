import { z } from "zod";

export const criarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const editarProdutoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export type ICriarProdutoBody = z.infer<typeof criarProdutoSchema>;
export type IEditarProdutoBody = z.infer<typeof editarProdutoSchema>;
