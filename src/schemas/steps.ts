import { z } from "zod";

export const criarStepsSequenciamentoschema = z.object({
  sequenciamento: z.object({
    dataInicio: z.string().min(1, "Data de início é obrigatório"),
    horarioInicio: z.string().min(1, "Horário de início é obrigatório"),
    regimeFaturamento: z.string().min(1, "Regime de faturamento é obrigatório"),
    horarioLimiteFaturamento: z
      .string()
      .min(1, "Horário limite de faturamento é obrigatório"),
    sabadoTrabalha: z.boolean(),
  }),
  estadoAtualMaquina: z
    .object({
      production_line_id: z.string().min(1, "Linha de produção é obrigatório"),
      maquina: z.string().min(1, "Máquina é obrigatório"),
      utilizacao: z.boolean(),
      codMolde: z.string().min(1, "Código do molde é obrigatório"),
      prodMaquinaInicioSequenciamento: z
        .string()
        .min(1, "Produto da máquina no início do sequenciamento é obrigatório"),
      status: z.enum(["Concluido", "Não concluido"]),
      numeroPedido: z.string().optional(),
      nome_cliente: z.string().optional(),
      tempoRestanteProdInjetora: z.string().optional(),
      tempoRestanteProdPosInjetora: z.string().optional(),
      demanda: z.string().optional(),
      valorAFAturar: z.string().optional(),
      dataLimiteFaturamento: z.string().optional(),
      horarioLimiteFaturamento: z.string().optional(),
    })
    .array(),
  paradasSequenciamento: z
    .object({
      production_line_id: z.string().min(1, "Linha de produção é obrigatório"),
      motivo: z.string(),
      maquina: z.string(),
      dataInicio: z.string(),
      horarioInicio: z.string(),
      dataFim: z.string(),
      horarioFim: z.string(),
    })
    .array()
    .optional(),
});

export type ICriaStepsSequenciamentoBody = z.infer<
  typeof criarStepsSequenciamentoschema
>;
