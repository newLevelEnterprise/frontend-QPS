import { z } from "zod";

export const criarmoldesSchema = z.object({
  name: z.string(),
  products: z.number().array(),
  total_cavities: z.number(),
  open_cavities: z.number(),
  scrap: z.number(),
  closed_cavity_risk: z.number(),
});

export const editarmoldesSchema = z.object({
  name: z.string(),
  products: z.number().array(),
  total_cavities: z.number(),
  open_cavities: z.number(),
  scrap: z.number(),
  closed_cavity_risk: z.number(),
});

export type IEditarMoldesBody = z.infer<typeof editarmoldesSchema>;

export type ICriarMoldesBody = z.infer<typeof criarmoldesSchema>;
