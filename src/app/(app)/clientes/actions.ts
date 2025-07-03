
"use server";

import sql from "mssql";
import { revalidatePath } from "next/cache";
import { sqlConfig } from "@/lib/db-config";
import type { Cliente, ClienteFormData } from "./schema";
import { clienteFormSchema } from "./schema";
import { mockClientes } from "@/data/mock-data";

const checkDbConfig = () => {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return;
  }
  if (!sqlConfig.server || !sqlConfig.user || !sqlConfig.database || !sqlConfig.password) {
    throw new Error("La configuración de la base de datos está incompleta. Por favor, revise las variables de entorno en el archivo .env.local y reinicie el servidor.");
  }
}

export async function fetchClientes(): Promise<Cliente[]> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    console.log("[OFFLINE_MODE] Serving mock clientes.");
    return Promise.resolve(mockClientes);
  }

  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(
      `SELECT Id, NombreEmpresa, ContactoPrincipal, EmailContacto, Telefono, Tipo, Estado, LogoUrl, FechaCreacion 
       FROM Clientes ORDER BY NombreEmpresa ASC`
    );
    
    return result.recordset.map(cliente => ({
        ...cliente,
        id: cliente.Id.toString(),
        fechaCreacion: cliente.FechaCreacion ? new Date(cliente.FechaCreacion).toISOString() : undefined,
        logoUrl: cliente.LogoUrl || undefined,
    })) as Cliente[];

  } catch (error) {
    console.error("Database error fetching clientes:", error);
    throw new Error("No se pudieron cargar los clientes.");
  } finally {
    if (pool) await pool.close();
  }
}

export async function addCliente(clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  const validation = clienteFormSchema.safeParse(clienteData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `Datos de cliente inválidos: ${errorMessages}` };
  }

  const { nombreEmpresa, contactoPrincipal, emailContacto, telefono, tipo, estado } = validation.data;
  const logoUrl = `https://placehold.co/40x40.png?text=${nombreEmpresa.substring(0,2).toUpperCase()}`;

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const checkEmail = await pool.request()
      .input('EmailContacto', sql.NVarChar, emailContacto)
      .query('SELECT Id FROM Clientes WHERE EmailContacto = @EmailContacto');

    if (checkEmail.recordset.length > 0) {
      return { success: false, error: "Este email de contacto ya está registrado para otro cliente." };
    }
    
    const result = await pool.request()
      .input('NombreEmpresa', sql.NVarChar, nombreEmpresa)
      .input('ContactoPrincipal', sql.NVarChar, contactoPrincipal)
      .input('EmailContacto', sql.NVarChar, emailContacto)
      .input('Telefono', sql.NVarChar, telefono)
      .input('Tipo', sql.NVarChar, tipo)
      .input('Estado', sql.NVarChar, estado)
      .input('LogoUrl', sql.NVarChar, logoUrl)
      .query(`INSERT INTO Clientes (NombreEmpresa, ContactoPrincipal, EmailContacto, Telefono, Tipo, Estado, LogoUrl, FechaCreacion) 
              OUTPUT INSERTED.Id, INSERTED.NombreEmpresa, INSERTED.ContactoPrincipal, INSERTED.EmailContacto, INSERTED.Telefono, INSERTED.Tipo, INSERTED.Estado, INSERTED.LogoUrl, INSERTED.FechaCreacion
              VALUES (@NombreEmpresa, @ContactoPrincipal, @EmailContacto, @Telefono, @Tipo, @Estado, @LogoUrl, GETDATE())`);
    
    revalidatePath("/(app)/clientes");
    const newClienteRaw = result.recordset[0];
    const newCliente: Cliente = {
        ...newClienteRaw,
        id: newClienteRaw.Id.toString(),
        fechaCreacion: newClienteRaw.FechaCreacion ? new Date(newClienteRaw.FechaCreacion).toISOString() : undefined,
        logoUrl: newClienteRaw.LogoUrl || undefined,
    };
    return { success: true, cliente: newCliente };
  } catch (error: any) {
    console.error("Database error adding cliente:", error);
     if (error.number === 2627) {
        return { success: false, error: "Este email de contacto ya está registrado." };
    }
    return { success: false, error: "No se pudo agregar el cliente." };
  } finally {
    if (pool) await pool.close();
  }
}

export async function updateCliente(clienteId: string, clienteData: ClienteFormData): Promise<{ success: boolean; error?: string; cliente?: Cliente }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  const validation = clienteFormSchema.safeParse(clienteData);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: `Datos de cliente inválidos: ${errorMessages}` };
  }
  const idAsNumber = parseInt(clienteId, 10);
   if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de cliente inválido." };
  }

  const { nombreEmpresa, contactoPrincipal, emailContacto, telefono, tipo, estado } = validation.data;
  const logoUrl = `https://placehold.co/40x40.png?text=${nombreEmpresa.substring(0,2).toUpperCase()}`;
  
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const checkEmail = await pool.request()
        .input('EmailContacto', sql.NVarChar, emailContacto)
        .input('Id', sql.Int, idAsNumber)
        .query('SELECT Id FROM Clientes WHERE EmailContacto = @EmailContacto AND Id <> @Id');
    if (checkEmail.recordset.length > 0) {
        return { success: false, error: "El nuevo email de contacto ya está en uso por otro cliente."};
    }

    const result = await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .input('NombreEmpresa', sql.NVarChar, nombreEmpresa)
      .input('ContactoPrincipal', sql.NVarChar, contactoPrincipal)
      .input('EmailContacto', sql.NVarChar, emailContacto)
      .input('Telefono', sql.NVarChar, telefono)
      .input('Tipo', sql.NVarChar, tipo)
      .input('Estado', sql.NVarChar, estado)
      .input('LogoUrl', sql.NVarChar, logoUrl)
      .query(`UPDATE Clientes 
              SET NombreEmpresa = @NombreEmpresa, ContactoPrincipal = @ContactoPrincipal, EmailContacto = @EmailContacto, 
                  Telefono = @Telefono, Tipo = @Tipo, Estado = @Estado, LogoUrl = @LogoUrl
              OUTPUT INSERTED.Id, INSERTED.NombreEmpresa, INSERTED.ContactoPrincipal, INSERTED.EmailContacto, INSERTED.Telefono, INSERTED.Tipo, INSERTED.Estado, INSERTED.LogoUrl, INSERTED.FechaCreacion
              WHERE Id = @Id`);
    
    revalidatePath("/(app)/clientes");
    const updatedClienteRaw = result.recordset[0];
    const updatedCliente: Cliente = {
        ...updatedClienteRaw,
        id: updatedClienteRaw.Id.toString(),
        fechaCreacion: updatedClienteRaw.FechaCreacion ? new Date(updatedClienteRaw.FechaCreacion).toISOString() : undefined,
        logoUrl: updatedClienteRaw.LogoUrl || undefined,
    };
    return { success: true, cliente: updatedCliente };
  } catch (error: any) {
    console.error("Database error updating cliente:", error);
    if (error.number === 2627) {
        return { success: false, error: "El nuevo email de contacto ya está en uso por otro cliente." };
    }
    return { success: false, error: "No se pudo actualizar el cliente." };
  } finally {
    if (pool) await pool.close();
  }
}

export async function deleteCliente(clienteId: string): Promise<{ success: boolean; error?: string }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  const idAsNumber = parseInt(clienteId, 10);
  if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de cliente inválido." };
  }

  try {
    pool = await sql.connect(sqlConfig);
    await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .query('DELETE FROM Clientes WHERE Id = @Id');
    
    revalidatePath("/(app)/clientes");
    return { success: true };
  } catch (error) {
    console.error("Database error deleting cliente:", error);
    return { success: false, error: "No se pudo eliminar el cliente." };
  } finally {
    if (pool) await pool.close();
  }
}
