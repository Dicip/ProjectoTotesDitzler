import { z } from "zod";

// Definición de ubicaciones y estados más detallados según el contexto de negocio.
export const TOTE_ESTADOS = ["Disponible", "En Uso", "En Lavado", "En Mantenimiento", "De Baja", "Con Cliente"] as const;
export const TOTE_UBICACIONES = [
  "Antecámara Planta",
  "Ken – Lavadora de CIP y COP de totes",
  "Patio de recepción",
  "Producción (Envasado)",
  "Cámara 1",
  "Antecámara CALM I",
  "Antecámara CALM II",
  "Cliente"
] as const;

export interface Tote {
  id: string; 
  codigoIdentificacion: string; // ID de RFID
  tipoMaterial: "Plástico HDPE" | "Acero Inoxidable" | "Otro";
  capacidad: number; 
  unidadCapacidad: "Litros" | "Kg";
  estadoActual: (typeof TOTE_ESTADOS)[number];
  ubicacion: (typeof TOTE_UBICACIONES)[number];
  fechaAdquisicion: string;
  // Campos nuevos basados en el contexto de RFID y negocio
  producto?: string;
  clienteId?: string | null;
  lote?: string;
  fechaEnvasado?: string | null;
  fechaVencimiento?: string | null;
  fechaDespacho?: string | null; // Fecha en que el estado cambia a "Con Cliente"
  notas?: string;
}

export const toteFormSchema = z.object({
  codigoIdentificacion: z.string().min(3, { message: "El código debe tener al menos 3 caracteres." }),
  tipoMaterial: z.enum(["Plástico HDPE", "Acero Inoxidable", "Otro"], { required_error: "Debe seleccionar un tipo de material." }),
  capacidad: z.coerce.number().min(0.1, { message: "La capacidad debe ser mayor a 0." }),
  unidadCapacidad: z.enum(["Litros", "Kg"], { required_error: "Debe seleccionar una unidad." }),
  estadoActual: z.enum(TOTE_ESTADOS, { required_error: "Debe seleccionar un estado." }),
  ubicacion: z.enum(TOTE_UBICACIONES, { required_error: "Debe seleccionar una ubicación." }),
  fechaAdquisicion: z.coerce.date(), // Solo para visualización, no editable.
  
  // Nuevos campos en el formulario
  producto: z.string().optional().nullable(),
  clienteId: z.string().optional().nullable(),
  lote: z.string().optional().nullable(),
  fechaEnvasado: z.string().optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
}).refine(data => {
    // Si el estado es "Con Cliente", la ubicación debe ser "Cliente" y debe tener un clienteId asignado.
    if (data.estadoActual === "Con Cliente") {
        return data.ubicacion === "Cliente" && !!data.clienteId;
    }
    return true;
}, {
    message: "Si el estado es 'Con Cliente', la ubicación debe ser 'Cliente' y se debe seleccionar un cliente.",
    path: ["clienteId"], // Asocia el error a un campo relevante.
});

export type ToteFormData = z.infer<typeof toteFormSchema>;
