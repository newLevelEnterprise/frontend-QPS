import { z } from "zod";

const externalIdSchema = z
  .string()
  .trim()
  .min(1, "ID externo é obrigatório")
  .max(120, "ID externo deve ter no máximo 120 caracteres");

export const criarClienteSchema = z.object({
  external_id: externalIdSchema,
  name: z.string().min(1, "Nome é obrigatório"),
  priority: z.string()
});

export const editarClienteSchema = z.object({
  external_id: externalIdSchema,
  name: z.string().min(1, "Nome é obrigatório"),
  priority: z.string()
});

export type IEditarClienteBody = z.infer<typeof editarClienteSchema>;

export type ICriarClienteBody = z.infer<typeof criarClienteSchema>;
