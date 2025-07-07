import { z } from "zod";

export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "La contraseña actual es obligatoria." }),
  newPassword: z.string().min(6, { message: "La nueva contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // path of the error
});

export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
