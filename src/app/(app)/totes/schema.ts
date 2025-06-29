import { z } from "zod";

export interface Tote {
  id: string; 
  codigoIdentificacion: string;
  tipoMaterial: "Plástico HDPE" | "Acero Inoxidable" | "Otro";
  capacidad: number; 
  unidadCapacidad: "Litros" | "Kg";
  estadoActual: "Disponible" | "En Uso" | "En Lavado" | "En Mantenimiento" | "De Baja";
  ubicacion: string; 
  fechaAdquisicion: string; 
  fechaRetornoPrevista?: string | null; 
  notas?: string;
}

export const toteFormSchema = z.object({
  codigoIdentificacion: z.string().min(3, { message: "El código debe tener al menos 3 caracteres." }),
  tipoMaterial: z.enum(["Plástico HDPE", "Acero Inoxidable", "Otro"], { required_error: "Debe seleccionar un tipo de material." }),
  capacidad: z.coerce.number().min(0.1, { message: "La capacidad debe ser mayor a 0." }),
  unidadCapacidad: z.enum(["Litros", "Kg"], { required_error: "Debe seleccionar una unidad." }),
  estadoActual: z.enum(["Disponible", "En Uso", "En Lavado", "En Mantenimiento", "De Baja"], { required_error: "Debe seleccionar un estado." }),
  ubicacion: z.string().min(2, { message: "La ubicación debe tener al menos 2 caracteres." }),
  fechaAdquisicion: z.coerce.date({
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_date) {
        return { message: "Fecha de ingreso inválida." };
      }
      return { message: ctx.defaultError };
    }
  }),
  fechaRetornoPrevista: z.string().optional().nullable(), // Kept simple for client-side, action will validate
  notas: z.string().optional().nullable(),
});

export type ToteFormData = z.infer<typeof toteFormSchema>;
