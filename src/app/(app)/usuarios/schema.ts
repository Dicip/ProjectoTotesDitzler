import { z } from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Inactive";
  avatar?: string;
  createdAt: string;
  registeredBy: string;
}

export const userFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, ingrese un email válido." }),
  role: z.enum(["Admin", "Editor", "Viewer"]),
  status: z.enum(["Active", "Inactive"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional().or(z.literal('')),
  confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});


export type UserFormData = z.infer<typeof userFormSchema>;
