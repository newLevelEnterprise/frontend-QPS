import { z } from "zod";

export const criarmoldesSchema = z.object({
  name: z.string(),
  products: z.number().array(),
  total_cavities: z.string().min(1, "Total de cavidades é obrigatório"),
  open_cavities: z.string().min(1, "Cavidades abertas é obrigatório"),
  scrap: z.string().min(1, "Refugo é obrigatório"),
  closed_cavity_risk: z
    .string()
    .min(1, "Risco de cavidade fechada é obrigatório"),
});

export const editarmoldesSchema = z.object({
  name: z.string(),
  products: z.number().array(),
  total_cavities: z.string().min(1, "Total de cavidades é obrigatório"),
  open_cavities: z.string().min(1, "Cavidades abertas é obrigatório"),
  scrap: z.string().min(1, "Refugo é obrigatório"),
  closed_cavity_risk: z
    .string()
    .min(1, "Risco de cavidade fechada é obrigatório"),
});

export type IEditarMoldesBody = z.infer<typeof editarmoldesSchema>;

export type ICriarMoldesBody = z.infer<typeof criarmoldesSchema>;
