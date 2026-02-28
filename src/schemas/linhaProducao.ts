import { z } from "zod";

export const criarLinhaSchema = z.object({
  name: z.string(),
});

export const editarLinhaSchema = z.object({
  name: z.string(),
});

export type IEditarLinhaBody = z.infer<typeof editarLinhaSchema>;

export type ICriarLinhaBody = z.infer<typeof criarLinhaSchema>;
