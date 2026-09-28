import { z } from "zod";

export const ACCEPTED_MOLDS_DEFAULT = 9999;

export function acceptedMoldsToDisplay(value: number | string | null | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed === ACCEPTED_MOLDS_DEFAULT) {
    return 0;
  }
  return parsed;
}

export function acceptedMoldsToStore(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return ACCEPTED_MOLDS_DEFAULT;
  }
  return parsed;
}

const quantidadeMoldes = z
  .string()
  .regex(/^\d+$/, "Quantidade de moldes deve ser um inteiro");

export const criarMaquinaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  disponibilidade: z.string(),
  quantidadeMoldes,
});

export const editarMaquinaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  disponibilidade: z.string(),
  quantidadeMoldes,
});

export type IEditarMaquinaBody = z.infer<typeof editarMaquinaSchema>;

export type ICriarMaquinaBody = z.infer<typeof criarMaquinaSchema>;
