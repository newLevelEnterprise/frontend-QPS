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