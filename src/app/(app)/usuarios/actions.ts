
"use server";

import type { User, UserFormData } from "./schema";
import { mockUsers } from "@/data/mock-data";

export async function fetchUsers(): Promise<User[]> {
  console.log("[DEMO_MODE] Serving mock users.");
  return mockUsers;
}

export async function addUser(userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  console.log("[DEMO_MODE] Simulating addUser.", userData);
  
  const existingUser = mockUsers.find(u => u.username.toLowerCase() === userData.username.toLowerCase());
  if (existingUser) {
    return { success: false, error: "Ya existe un usuario con este nombre de usuario." };
  }

  if (!userData.password) {
      return { success: false, error: "La contraseña es obligatoria para nuevos usuarios." };
  }

  const newUser: User = {
    id: `usr_${userData.username.toLowerCase()}`,
    name: userData.name,
    username: userData.username,
    email: userData.email || undefined,
    password: userData.password,
    role: userData.role,
    status: userData.status,
    avatar: `https://placehold.co/40x40.png?text=${userData.name.substring(0,1)}`,
    createdAt: new Date().toISOString(),
    registeredBy: 'Admin Panel',
  };
  
  return { success: true, user: newUser };
}

export async function updateUser(userId: string, userData: UserFormData): Promise<{ success: boolean; error?: string; user?: User }> {
  console.log(`[DEMO_MODE] Simulating updateUser for userId: ${userId}`, userData);
  
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: "Usuario no encontrado." };
  }

  const originalUser = mockUsers[userIndex];

  // Check for username uniqueness if it has been changed
  if (userData.username.toLowerCase() !== originalUser.username.toLowerCase()) {
    const existingUser = mockUsers.find(u => u.username.toLowerCase() === userData.username.toLowerCase() && u.id !== userId);
    if (existingUser) {
      return { success: false, error: "Ya existe otro usuario con este nombre de usuario." };
    }
  }

  const updatedUser: User = {
    ...originalUser,
    id: `usr_${userData.username.toLowerCase()}`, // Recalculate ID
    name: userData.name,
    username: userData.username,
    email: userData.email || undefined,
    role: userData.role,
    status: userData.status,
    // Keep original password if new one is not provided
    password: userData.password ? userData.password : originalUser.password,
  };
  
  return { success: true, user: updatedUser };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[DEMO_MODE] Simulating deleteUser for userId: ${userId}`);
  
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: "Usuario no encontrado." };
  }
  
  return { success: true };
}
