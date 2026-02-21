import { z } from "zod";

export const criarmoldesSchema = z.object({
  nome: z.string(),
  produto: z.string(),
  totalCavidades: z.number(),
  cavidadesAbertas: z.number(),
  refugo: z.number(),
  riscoDeCavidade: z.number(),
});

export const editarmoldesSchema = z.object({
  nome: z.string(),
  produto: z.string(),
  totalCavidades: z.number(),
  cavidadesAbertas: z.number(),
  refugo: z.number(),
  riscoDeCavidade: z.number(),
});

export type IEditarMoldesBody = z.infer<typeof editarmoldesSchema>;

export type ICriarMoldesBody = z.infer<typeof criarmoldesSchema>;
