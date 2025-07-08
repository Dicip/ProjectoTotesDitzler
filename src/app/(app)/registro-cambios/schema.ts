
export interface LogEntry {
  id: string;
  fecha: string; // ISO string
  usuario: string; // User name or "System"
  accion: 'Creación' | 'Edición' | 'Eliminación' | 'Sistema' | 'Login';
  entidad: 'Usuario' | 'Cliente' | 'Tote' | 'Sistema' | 'Autenticación';
  descripcion: string;
}
