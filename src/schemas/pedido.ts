import { z } from 'zod';
export const pedidoSchema = z.object({
  name: z.string(),
  promised_date: z.string().datetime(),
  sequencing_start_date: z.string().datetime(),
  total_time_sec: z.number(),
  demand: z.number(),
  total_time_hours: z.number(),
  deadline_days: z.number(),
  deadline_hours: z.number(),
  product_value: z.number(),
  produzido: z.number(),
  fk_id_client: z.number(),
  fk_id_product: z.number()
});

export const criarPedidoSchema = z.object({
  promised_date: z.string().nonempty('Data prometida não pode ser vazia'),
  promised_hour: z.string().nonempty('Hora prometida não pode ser vazia'),
  demand: z.string().nonempty('Demanda não pode ser vazia'),
  product_value: z.string().nonempty('Valor do produto não pode ser vazio'),
  deadline_days: z.string().nonempty('Prazo não pode ser vazio'),
  cycle: z.string().nonempty('Ciclo não pode ser vazio'),
  fk_id_client: z.string().nonempty('Cliente não pode ser vazio'),
  fk_id_product: z.string().nonempty('Produto não pode ser vazio')
});

export type IPedidoBody = z.infer<typeof pedidoSchema>;
export type ICriarPedidoBody = z.infer<typeof criarPedidoSchema>;

export const JOB_PRIORITIES = ["1", "2", "3", "4", "9"] as const;

export function parseBrDecimal(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, "").replace(/^R\$/, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export const jobManualSchema = z.object({
  fk_id_client: z.string().min(1, "Cliente é obrigatório"),
  fk_id_product: z.string().min(1, "Produto é obrigatório"),
  demand: z.string().refine((value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
  }, "Demanda deve ser um inteiro maior que zero"),
  product_value: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine((value) => {
      const parsed = parseBrDecimal(value);
      return parsed !== null && parsed >= 0;
    }, "Valor inválido"),
  promised_date: z.string().min(1, "Data prometida é obrigatória"),
  promised_hour: z.string().min(1, "Hora prometida é obrigatória"),
  priority: z.enum(JOB_PRIORITIES, { message: "Prioridade deve ser 1, 2, 3, 4 ou 9" }),
});

export type IJobManualBody = z.infer<typeof jobManualSchema>;