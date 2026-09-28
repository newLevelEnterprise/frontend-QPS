import { z } from "zod";

export const criarProdutoSchema = z
  .object({
    external_id: z
      .string()
      .max(120, "ID externo deve ter no máximo 120 caracteres"),
    name: z.string().min(1, "Nome é obrigatório"),
    post_injection_cycle_time: z
      .string()
      .min(1, "Tempo de pós-injeção é obrigatório")
      .regex(/^\d+$/, "Tempo de pós-injeção deve ser um inteiro em segundos"),
    structureType: z.enum(["simple", "compound"]),
    components: z
      .array(
        z.object({
          component_product_id: z.string().optional(),
          name: z.string().optional(),
          external_id: z.string().max(120).optional(),
          quantity: z.string().min(1, "Quantidade é obrigatória"),
        }),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.structureType !== "compound") {
      return;
    }
    if (!data.components || data.components.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Adicione pelo menos um componente",
        path: ["components"],
      });
      return;
    }
    data.components.forEach((component, index) => {
      const hasId = Boolean(component.component_product_id);
      const hasName = Boolean(component.name?.trim());
      if (hasId === hasName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione uma peça existente ou informe o nome de uma nova",
          path: ["components", index, "name"],
        });
      }
      const quantity = Number(component.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantidade deve ser um inteiro maior que zero",
          path: ["components", index, "quantity"],
        });
      }
    });
  });

export const editarProdutoSchema = criarProdutoSchema;

export type ICriarProdutoBody = z.infer<typeof criarProdutoSchema>;
export type IEditarProdutoBody = z.infer<typeof editarProdutoSchema>;
