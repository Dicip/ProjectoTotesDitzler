
"use server";

import sql from "mssql";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sqlConfig } from "@/lib/db-config"; 
import { parseISO, isValid, format } from "date-fns";
import type { Tote, ToteFormData } from "./schema";
import { toteFormSchema } from "./schema";

const checkDbConfig = () => {
  if (!sqlConfig.server || !sqlConfig.user || !sqlConfig.database || !sqlConfig.password) {
    throw new Error("La configuración de la base de datos está incompleta. Por favor, revise las variables de entorno en el archivo .env.local y reinicie el servidor.");
  }
}

export async function fetchTotes(): Promise<Tote[]> {
  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(
      `SELECT Id, CodigoIdentificacion, TipoMaterial, Capacidad, UnidadCapacidad, EstadoActual, UbicacionActual as ubicacion, FechaAdquisicion, FechaRetornoPrevista, Notas 
       FROM Totes ORDER BY FechaAdquisicion DESC`
    );
    
    return result.recordset.map(tote => ({
        ...tote,
        id: tote.Id.toString(),
        capacidad: parseFloat(tote.Capacidad),
        ubicacion: tote.ubicacion || undefined, 
        fechaAdquisicion: new Date(tote.FechaAdquisicion).toISOString(),
        fechaRetornoPrevista: tote.FechaRetornoPrevista ? new Date(tote.FechaRetornoPrevista).toISOString() : null,
        notas: tote.Notas || undefined, 
    })) as Tote[];

  } catch (error) {
    console.error("Database error fetching totes:", error);
    throw new Error("No se pudieron cargar los totes.");
  } finally {
    if (pool) await pool.close();
  }
}


export async function updateTote(toteId: string, toteData: ToteFormData): Promise<{ success: boolean; error?: string; tote?: Tote }> {
  checkDbConfig();
  const validation = toteFormSchema.safeParse(toteData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `Datos de tote inválidos: ${errorMessages}` };
  }
  const idAsNumber = parseInt(toteId, 10);
   if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de tote inválido." };
  }

  // Manual validation for fechaRetornoPrevista string
  let parsedRetornoDate: Date | null = null;
  if (validation.data.fechaRetornoPrevista) {
    const parsed = parseISO(validation.data.fechaRetornoPrevista);
    if (!isValid(parsed)) {
      return { success: false, error: "La fecha de retorno prevista tiene un formato inválido." };
    }
    parsedRetornoDate = parsed;
  }

  const { codigoIdentificacion, tipoMaterial, capacidad, unidadCapacidad, estadoActual, ubicacion, notas } = validation.data;
  
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const checkCodigo = await pool.request()
        .input('CodigoIdentificacion', sql.NVarChar, codigoIdentificacion)
        .input('Id', sql.Int, idAsNumber)
        .query('SELECT Id FROM Totes WHERE CodigoIdentificacion = @CodigoIdentificacion AND Id <> @Id');
    if (checkCodigo.recordset.length > 0) {
        return { success: false, error: "El nuevo código de identificación ya está en uso por otro tote."};
    }

    const result = await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .input('CodigoIdentificacion', sql.NVarChar, codigoIdentificacion)
      .input('TipoMaterial', sql.NVarChar, tipoMaterial)
      .input('Capacidad', sql.Decimal(10,2), capacidad)
      .input('UnidadCapacidad', sql.NVarChar, unidadCapacidad)
      .input('EstadoActual', sql.NVarChar, estadoActual)
      .input('UbicacionActual', sql.NVarChar, ubicacion)
      .input('FechaRetornoPrevista', sql.DateTime, parsedRetornoDate) // Pass manually parsed Date object or null
      .input('Notas', sql.NVarChar, notas || null) 
      .input('UltimaModificacion', sql.DateTime, new Date())
      .query(`UPDATE Totes 
              SET CodigoIdentificacion = @CodigoIdentificacion, TipoMaterial = @TipoMaterial, Capacidad = @Capacidad, 
                  UnidadCapacidad = @UnidadCapacidad, EstadoActual = @EstadoActual, UbicacionActual = @UbicacionActual,
                  FechaRetornoPrevista = @FechaRetornoPrevista, Notas = @Notas, UltimaModificacion = @UltimaModificacion
              OUTPUT INSERTED.Id, INSERTED.CodigoIdentificacion, INSERTED.TipoMaterial, INSERTED.Capacidad, INSERTED.UnidadCapacidad, 
                     INSERTED.EstadoActual, INSERTED.UbicacionActual as ubicacion, INSERTED.FechaAdquisicion, 
                     INSERTED.FechaRetornoPrevista, INSERTED.Notas
              WHERE Id = @Id`);
    
    revalidatePath("/(app)/totes");
    const updatedToteRaw = result.recordset[0];
    const updatedTote: Tote = {
        ...updatedToteRaw,
        id: updatedToteRaw.Id.toString(),
        capacidad: parseFloat(updatedToteRaw.Capacidad),
        fechaAdquisicion: new Date(updatedToteRaw.FechaAdquisicion).toISOString(),
        fechaRetornoPrevista: updatedToteRaw.FechaRetornoPrevista ? new Date(updatedToteRaw.FechaRetornoPrevista).toISOString() : null,
        notas: updatedToteRaw.Notas || undefined,
    };
    return { success: true, tote: updatedTote };
  } catch (error: any) {
    console.error("Database error updating tote:", error);
    if (error.number === 2627) { 
        return { success: false, error: "El código de identificación ya está en uso por otro tote." };
    }
    return { success: false, error: "No se pudo actualizar el tote." };
  } finally {
    if (pool) await pool.close();
  }
}

export async function deleteTote(toteId: string): Promise<{ success: boolean; error?: string }> {
  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  const idAsNumber = parseInt(toteId, 10);
  if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de tote inválido." };
  }

  try {
    pool = await sql.connect(sqlConfig);
    await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .query('DELETE FROM Totes WHERE Id = @Id');
    
    revalidatePath("/(app)/totes");
    return { success: true };
  } catch (error) {
    console.error("Database error deleting tote:", error);
    return { success: false, error: "No se pudo eliminar el tote." };
  } finally {
    if (pool) await pool.close();
  }
}
