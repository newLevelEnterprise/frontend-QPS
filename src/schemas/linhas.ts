import { z } from "zod";

export const criarLinhasProdSchema = z.object({
  produto: z.string().min(1, "Nome é obrigatório"),
  codMolde: z.string().min(1, "Código do molde é obrigatório"),
  maquinas: z
    .array(
      z.object({
        machineId: z.string().min(1, "Máquina é obrigatória"),
        tempoCiclo: z
          .string()
          .min(1, "Tempo de ciclo é obrigatório")
          .regex(/^\d+(\.\d+)?$/, "Tempo de ciclo deve ser numérico"),
      }),
    )
    .min(1, "Adicione ao menos uma máquina"),
});

export const editarLinhasProdSchema = z.object({
  produto: z.string().min(1, "Nome é obrigatório"),
  codMolde: z.string().min(1, "Código do molde é obrigatório"),
});

export type IEditarLinhasProdBody = z.infer<typeof editarLinhasProdSchema>;

export type ICriarLinhasProdBody = z.infer<typeof criarLinhasProdSchema>;
