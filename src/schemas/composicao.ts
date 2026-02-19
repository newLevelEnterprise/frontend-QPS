import { z } from "zod";

export const criarComposicaoSchema = z.object({
  produto: z.string().min(1, "Produto é obrigatório"),
  ppvirgem: z.number().min(0, "PP Virgem é obrigatório"),
  pevirgem: z.number().min(0, "PE Virgem é obrigatório"),
  peadvirgem: z.number().min(0, "PEAD Virgem é obrigatório"),
  master: z.number().min(0, "Master é obrigatório"),
  ppreciclado: z.number().min(0, "PP Reciclado é obrigatório"),
  garrasmetalicas: z.number().min(0, "Garras metálicas é obrigatório"),
  suporteaco: z.number().min(0, "Suporte de aço é obrigatório"),
});

export const editarComposicaoSchema = z.object({
  id: z.number().min(1, "ID é obrigatório"),
  produto: z.string().min(1, "Produto é obrigatório"),
  ppvirgem: z.number().min(0, "PP Virgem é obrigatório"),
  pevirgem: z.number().min(0, "PE Virgem é obrigatório"),
  peadvirgem: z.number().min(0, "PEAD Virgem é obrigatório"),
  master: z.number().min(0, "Master é obrigatório"),
  ppreciclado: z.number().min(0, "PP Reciclado é obrigatório"),
  garrasmetalicas: z.number().min(0, "Garras metálicas é obrigatório"),
  suporteaco: z.number().min(0, "Suporte de aço é obrigatório"),
});

export type IEditarComposicaoBody = z.infer<typeof editarComposicaoSchema>;

export type ICriarComposicaoBody = z.infer<typeof criarComposicaoSchema>;
