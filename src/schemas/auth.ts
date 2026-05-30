import { z } from "zod";

export const signinSchema = z.object({
  email: z.string().email("Email incorreto"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(24, "Senha deve ter no máximo 24 caracteres"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido"),
  token: z
    .string()
    .min(1, "Token é obrigatório")
    .max(32, "Token deve ter no máximo 32 caracteres"),
  termos: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
  politica: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos de política de privacidade",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
});

export type SignInBody = z.infer<typeof signinSchema>;
export type SignUpBody = z.infer<typeof signupSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
