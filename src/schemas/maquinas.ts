import { z } from "zod";

export const criarMaquinaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  disponibilidade: z.string(),
});

export const editarMaquinaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  disponibilidade: z.string(),
});

export type IEditarMaquinaBody = z.infer<typeof editarMaquinaSchema>;

export type ICriarMaquinaBody = z.infer<typeof criarMaquinaSchema>;
