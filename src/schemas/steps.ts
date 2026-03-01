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
      maquina: z.string().min(1, "Máquina é obrigatório"),
      utilizacao: z.boolean(),
      codMolde: z.string().min(1, "Código do molde é obrigatório"),
      prodMaquinaInicioSequenciamento: z
        .string()
        .min(1, "Produto da máquina no início do sequenciamento é obrigatório"),
      status: z.enum(["Concluido", "Não concluido"]),
      numeroPedido: z.string().min(1, "Número do pedido é obrigatório"),
      tempoRestanteProdInjetora: z
        .string()
        .min(1, "Tempo restante de produção na injetora é obrigatório")
        .optional(),
      tempoRestanteProdPosInjetora: z
        .string()
        .min(1, "Tempo restante de produção pós injetora é obrigatório")
        .optional(),
      demanda: z.string().min(1, "Demanda é obrigatório").optional(),
      valorAFAturar: z
        .string()
        .min(1, "Valor a faturar é obrigatório")
        .optional(),
      dataLimiteFaturamento: z
        .string()
        .min(1, "Data limite de faturamento é obrigatório")
        .optional(),
      horarioLimiteFaturamento: z
        .string()
        .min(1, "Horário limite de faturamento é obrigatório")
        .optional(),
    })
    .array(),
  paradasSequenciamento: z
    .object({
      motivo: z.string().min(1, "Motivo da parada é obrigatório"),
      maquina: z.string().min(1, "Máquina é obrigatório"),
      dataInicio: z.string().min(1, "Data de início é obrigatório"),
      horarioInicio: z.string().min(1, "Horário de início é obrigatório"),
      dataFim: z.string().min(1, "Data de fim é obrigatório"),
      horarioFim: z.string().min(1, "Horário de fim é obrigatório"),
    })
    .array(),
});

export type ICriaStepsSequenciamentoBody = z.infer<
  typeof criarStepsSequenciamentoschema
>;
