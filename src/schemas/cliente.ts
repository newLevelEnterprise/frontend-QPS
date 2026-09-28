import { z } from "zod";



export const criarClienteSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
  priority: z.string()
});

export const editarClienteSchema = z.object({
  external_id: z
    .string()
    .max(120, "ID externo deve ter no máximo 120 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
  priority: z.string()
});

export type IEditarClienteBody = z.infer<typeof editarClienteSchema>;

export type ICriarClienteBody = z.infer<typeof criarClienteSchema>;