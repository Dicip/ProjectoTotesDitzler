import { z } from "zod";

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
  codigoIdentificacion: string; 
  tipoMaterial: "Plástico HDPE" | "Acero Inoxidable" | "Otro";
  capacidad: number; 
  unidadCapacidad: "Litros" | "Kg";
  estadoActual: (typeof TOTE_ESTADOS)[number];
  ubicacion: (typeof TOTE_UBICACIONES)[number];
  fechaAdquisicion: string;
  producto?: string;
  clienteId?: string | null;
  operadorId?: string | null;
  lote?: string;
  fechaEnvasado?: string | null;
  fechaVencimiento?: string | null;
  fechaDespacho?: string | null;
  notas?: string;
}

export const toteFormSchema = z.object({
  codigoIdentificacion: z.string().min(3, { message: "El código debe tener al menos 3 caracteres." }),
  tipoMaterial: z.enum(["Plástico HDPE", "Acero Inoxidable", "Otro"], { required_error: "Debe seleccionar un tipo de material." }),
  capacidad: z.coerce.number().min(0.1, { message: "La capacidad debe ser mayor a 0." }),
  unidadCapacidad: z.enum(["Litros", "Kg"], { required_error: "Debe seleccionar una unidad." }),
  estadoActual: z.enum(TOTE_ESTADOS, { required_error: "Debe seleccionar un estado." }),
  ubicacion: z.enum(TOTE_UBICACIONES, { required_error: "Debe seleccionar una ubicación." }),
  
  producto: z.string().optional().nullable(),
  clienteId: z.string().optional().nullable(),
  operadorId: z.string().optional().nullable(),
  lote: z.string().optional().nullable(),
  fechaEnvasado: z.string().optional().nullable(),
  fechaVencimiento: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
    const isProductFilled = !!data.producto || !!data.lote || !!data.fechaEnvasado || !!data.fechaVencimiento;
    const productRequiredStates: (typeof TOTE_ESTADOS)[number][] = ["Con Cliente", "En Uso"];
    const productForbiddenStates: (typeof TOTE_ESTADOS)[number][] = ["Disponible", "En Lavado", "En Mantenimiento", "De Baja"];

    if (productRequiredStates.includes(data.estadoActual) && !data.producto) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Se requiere un producto para los totes en este estado.",
            path: ["producto"],
        });
    }

    if (productForbiddenStates.includes(data.estadoActual) && isProductFilled) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La información de producto solo se aplica a totes 'En Uso' o 'Con Cliente'.",
            path: ["producto"],
        });
    }

    if (data.estadoActual === "Con Cliente") {
        if (!data.clienteId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Se debe seleccionar un cliente.",
                path: ["clienteId"],
            });
        }
        if (data.ubicacion !== "Cliente") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La ubicación debe ser 'Cliente'.",
                path: ["ubicacion"],
            });
        }
    } else {
         if (data.clienteId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Solo se puede asignar un cliente a un tote con estado 'Con Cliente'.",
                path: ["clienteId"],
            });
        }
        if (data.ubicacion === 'Cliente' && data.estadoActual !== 'Con Cliente'){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La ubicación 'Cliente' solo es válida si el estado es 'Con Cliente'.",
                path: ['ubicacion']
            })
        }
    }
});

export type ToteFormData = z.infer<typeof toteFormSchema>;
