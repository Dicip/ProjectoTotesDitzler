

// Esta interfaz define la estructura de los datos del usuario que guardamos en la sesión.
// Las acciones de servidor se han movido a lógica del lado del cliente para
// funcionar correctamente con el modo de demostración basado en LocalStorage.
export interface UserSessionData {
  userId: string | number;
  username: string;
  email?: string;
  nombre: string;
  rol: string;
}
