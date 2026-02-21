import { z } from "zod";

export const criarLinhasProdSchema = z.object({
  produto: z.string().min(1, "Nome é obrigatório"),
  codMolde: z.string().min(1, "Código do molde é obrigatório"),
});

export const editarLinhasProdSchema = z.object({
  produto: z.string().min(1, "Nome é obrigatório"),
  codMolde: z.string().min(1, "Código do molde é obrigatório"),
});

export type IEditarLinhasProdBody = z.infer<typeof editarLinhasProdSchema>;

export type ICriarLinhasProdBody = z.infer<typeof criarLinhasProdSchema>;
