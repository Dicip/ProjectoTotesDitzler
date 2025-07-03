
"use server";

import sql from "mssql";
import { revalidatePath } from "next/cache";
import { sqlConfig } from "@/lib/db-config";
import type { User, UserFormData } from "./schema";
import { userFormSchema } from "./schema";
import { mockUsers } from "@/data/mock-data";

const checkDbConfig = () => {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return;
  }
  if (!sqlConfig.server || !sqlConfig.user || !sqlConfig.database || !sqlConfig.password) {
    throw new Error("La configuración de la base de datos está incompleta. Por favor, revise las variables de entorno en el archivo .env.local y reinicie el servidor.");
  }
}

export async function fetchUsers(): Promise<User[]> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    console.log("[OFFLINE_MODE] Serving mock users.");
    return mockUsers;
  }

  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(
      `SELECT Id, NombreCompleto as name, Email, Rol as role, Estado as status, AvatarUrl as avatar, FechaCreacion as createdAt, RegistradoPor as registeredBy 
       FROM Usuarios ORDER BY FechaCreacion DESC`
    );
    
    return result.recordset.map(user => ({
        ...user,
        id: user.Id.toString(),
        createdAt: new Date(user.createdAt).toISOString(),
    })) as User[];

  } catch (error) {
    console.error("Database error fetching users:", error);
    throw new Error("No se pudieron cargar los usuarios.");
  } finally {
    if (pool) await pool.close();
  }
}

export async function addUser(userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  const validation = userFormSchema.safeParse(userData);
  if (!validation.success) {
    return { success: false, error: "Datos de usuario inválidos." };
  }

  const { name, email, role, status } = validation.data;
  const defaultPasswordHash = "defaultPassword123";

  let pool: sql.ConnectionPool | null = null;
  try {
    pool = await sql.connect(sqlConfig);
    
    const checkUser = await pool.request()
      .input('Email', sql.NVarChar, email)
      .query('SELECT Id FROM Usuarios WHERE Email = @Email');

    if (checkUser.recordset.length > 0) {
      return { success: false, error: "Este email ya está registrado." };
    }

    const result = await pool.request()
      .input('NombreCompleto', sql.NVarChar, name)
      .input('Email', sql.NVarChar, email)
      .input('PasswordHash', sql.NVarChar, defaultPasswordHash)
      .input('Rol', sql.NVarChar, role)
      .input('Estado', sql.NVarChar, status)
      .input('AvatarUrl', sql.NVarChar, `https://placehold.co/40x40.png?text=${name.substring(0,2).toUpperCase()}`)
      .input('RegistradoPor', sql.NVarChar, 'Admin Panel')
      .query(`INSERT INTO Usuarios (NombreCompleto, Email, PasswordHash, Rol, Estado, AvatarUrl, RegistradoPor, FechaCreacion) 
              OUTPUT INSERTED.Id, INSERTED.NombreCompleto as name, INSERTED.Email, INSERTED.Rol as role, INSERTED.Estado as status, INSERTED.AvatarUrl as avatar, INSERTED.FechaCreacion as createdAt, INSERTED.RegistradoPor as registeredBy
              VALUES (@NombreCompleto, @Email, @PasswordHash, @Rol, @Estado, @AvatarUrl, @RegistradoPor, GETDATE())`);
    
    revalidatePath("/(app)/usuarios");
    const newUserRaw = result.recordset[0];
    const newUser: User = { 
        ...newUserRaw,
        id: newUserRaw.Id.toString(),
        createdAt: new Date(newUserRaw.createdAt).toISOString()
    };
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Database error adding user:", error);
    if (error.number === 2627) {
        return { success: false, error: "Este email ya está registrado." };
    }
    return { success: false, error: "No se pudo agregar el usuario." };
  } finally {
    if (pool) await pool.close();
  }
}

export async function updateUser(userId: string, userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  const validation = userFormSchema.safeParse(userData);
  if (!validation.success) {
    return { success: false, error: "Datos de usuario inválidos." };
  }
  const idAsNumber = parseInt(userId, 10);
  if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de usuario inválido." };
  }

  const { name, email, role, status } = validation.data;
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await sql.connect(sqlConfig);
    const checkEmail = await pool.request()
        .input('Email', sql.NVarChar, email)
        .input('Id', sql.Int, idAsNumber)
        .query('SELECT Id FROM Usuarios WHERE Email = @Email AND Id <> @Id');
    if (checkEmail.recordset.length > 0) {
        return { success: false, error: "El nuevo email ya está en uso por otro usuario."};
    }

    const result = await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .input('NombreCompleto', sql.NVarChar, name)
      .input('Email', sql.NVarChar, email)
      .input('Rol', sql.NVarChar, role)
      .input('Estado', sql.NVarChar, status)
      .input('AvatarUrl', sql.NVarChar, `https://placehold.co/40x40.png?text=${name.substring(0,2).toUpperCase()}`)
      .query(`UPDATE Usuarios 
              SET NombreCompleto = @NombreCompleto, Email = @Email, Rol = @Rol, Estado = @Estado, AvatarUrl = @AvatarUrl
              OUTPUT INSERTED.Id, INSERTED.NombreCompleto as name, INSERTED.Email, INSERTED.Rol as role, INSERTED.Estado as status, INSERTED.AvatarUrl as avatar, INSERTED.FechaCreacion as createdAt, INSERTED.RegistradoPor as registeredBy
              WHERE Id = @Id`);
    
    revalidatePath("/(app)/usuarios");
    const updatedUserRaw = result.recordset[0];
    const updatedUser: User = {
        ...updatedUserRaw,
        id: updatedUserRaw.Id.toString(),
        createdAt: new Date(updatedUserRaw.createdAt).toISOString()
    };
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Database error updating user:", error);
    if (error.number === 2627) {
        return { success: false, error: "El nuevo email ya está en uso por otro usuario." };
    }
    return { success: false, error: "No se pudo actualizar el usuario." };
  } finally {
    if (pool) await pool.close();
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  if (process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true') {
    return { success: false, error: "Esta función está deshabilitada en modo offline." };
  }

  checkDbConfig();
  let pool: sql.ConnectionPool | null = null;
  const idAsNumber = parseInt(userId, 10);
  if (isNaN(idAsNumber)) {
    return { success: false, error: "ID de usuario inválido." };
  }

  try {
    pool = await sql.connect(sqlConfig);
    await pool.request()
      .input('Id', sql.Int, idAsNumber)
      .query('DELETE FROM Usuarios WHERE Id = @Id');
    
    revalidatePath("/(app)/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Database error deleting user:", error);
    return { success: false, error: "No se pudo eliminar el usuario." };
  } finally {
    if (pool) await pool.close();
  }
}
