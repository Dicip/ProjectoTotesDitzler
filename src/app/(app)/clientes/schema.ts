
import { z } from "zod";

export interface Cliente {
  id: string;
  nombreEmpresa: string;
  contactoPrincipal: string;
  emailContacto: string;
  telefono: string;
  tipo: "Mayorista" | "Minorista" | "Distribuidor";
  estado: "Activo" | "Inactivo";
  logoUrl?: string;
  fechaCreacion?: string;
}

export const clienteFormSchema = z.object({
  nombreEmpresa: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres." }),
  contactoPrincipal: z.string().min(2, { message: "El nombre del contacto debe tener al menos 2 caracteres." }),
  emailContacto: z.string().email({ message: "Por favor, ingrese un email válido para el contacto." }),
  telefono: z.string().min(7, { message: "El teléfono debe tener al menos 7 dígitos." }).regex(/^\+?[0-9\s-()]+$/, { message: "Formato de teléfono inválido."}),
  tipo: z.enum(["Mayorista", "Minorista", "Distribuidor"], {
    required_error: "Debe seleccionar un tipo de cliente.",
  }),
  estado: z.enum(["Activo", "Inactivo"], {
    required_error: "Debe seleccionar un estado.",
  }),
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;
