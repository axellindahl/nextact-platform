import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Ange en giltig e-postadress"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
});

export const magicLinkSchema = z.object({
  email: z.email("Ange en giltig e-postadress"),
});

export const registerSchema = z.object({
  email: z.email("Ange en giltig e-postadress"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
  displayName: z.string().min(2, "Namnet måste vara minst 2 tecken"),
  phoneNumber: z.string().min(7, "Ange ett giltigt mobilnummer"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
