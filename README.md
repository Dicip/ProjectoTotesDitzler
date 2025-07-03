
# Firebase Studio

Este es un proyecto de inicio de NextJS en Firebase Studio.

Para empezar, echa un vistazo a /src/app/page.tsx.

## Modo Offline (Demostración)

La aplicación incluye un modo offline para demostraciones, que utiliza datos de ejemplo internos en lugar de conectarse a una base de datos real.

-   **Para activar el modo offline (por defecto):** En el archivo `.env`, asegúrese de que la variable `NEXT_PUBLIC_OFFLINE_MODE` esté establecida en `true`.
    ```dotenv
    NEXT_PUBLIC_OFFLINE_MODE=true
    ```
-   **Para desactivar el modo offline y conectar a la base de datos:** Cambie la variable a `false` y asegúrese de que sus credenciales de SQL Server estén configuradas correctamente en el mismo archivo.
    ```dotenv
    NEXT_PUBLIC_OFFLINE_MODE=false
    ```

**Notas sobre el modo offline:**
- Las funciones para agregar, editar o eliminar registros estarán deshabilitadas.
- Podrá iniciar sesión con el usuario `adm` (contraseña `123`) o con cualquiera de los siguientes usuarios de ejemplo (cualquier contraseña funcionará):
  - `ana.martinez@example.com` (Admin)
  - `carlos.gomez@example.com` (Editor)
  - `jorge.diaz@example.com` (Viewer)


## Ejecución de la Aplicación

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno:**
    La aplicación utiliza un archivo `.env` en la raíz del proyecto para la configuración. Por defecto, está en modo offline. Para conectarse a una base de datos, edite este archivo.

    Ejemplo `.env` para conexión a base de datos (modo online):
    ```dotenv
    # Poner en 'false' para conectar a la base de datos
    NEXT_PUBLIC_OFFLINE_MODE=false

    # Detalles de conexión a SQL Server
    DB_SERVER=your_sql_server.database.windows.net
    DB_DATABASE=your_database_name
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_PORT=1433
    DB_ENCRYPT=true
    DB_TRUST_SERVER_CERTIFICATE=false
    ```
    
3.  **Configurar Esquema de Base de Datos y Datos Iniciales (Solo para modo online):**
    Para inicializar tu base de datos SQL Server, usa el script proporcionado.
    - El script se encuentra en `src/database/schema-and-sample-data.sql`.
    - Conéctate a tu base de datos y ejecuta el script.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

5.  **Ejecutar Genkit (para funciones de IA, en una terminal separada):**
    ```bash
    npm run genkit:dev
    ```

## Integración con SQL Server

-   **Consultas:** El servicio `src/lib/sqlserver-service.ts` y los archivos de acciones en `src/app/(app)/*/actions.ts` contienen las consultas SQL para obtener los datos. Si usaste el script `schema-and-sample-data.sql`, estas consultas deberían funcionar directamente. Si tienes una base de datos existente, es posible que necesites ajustar las consultas a tu esquema.

## Estructura del Proyecto

-   `src/app`: Contiene las páginas y layouts de Next.js (App Router).
-   `src/components`: Contiene componentes de UI reutilizables.
-   `src/lib`: Contiene funciones de utilidad y servicios.
-   `src/data`: Contiene definiciones de tipos y datos de demostración.
-   `src/ai`: Contiene flujos de Genkit y configuraciones de IA.
-   `src/database`: Scripts SQL para el esquema de la base de datos.
-   `public`: Activos estáticos.

## Tecnologías Clave

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI
-   Genkit (para IA)
-   MSSQL (base de datos)
