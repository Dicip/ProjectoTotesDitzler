
# Firebase Studio

Este es un proyecto de inicio de NextJS en Firebase Studio.

Para empezar, echa un vistazo a /src/app/page.tsx.

## Ejecución de la Aplicación

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno para Conexión a SQL Server:**
    Para conectar la aplicación a tu base de datos SQL Server, crea un archivo llamado `.env.local` en la raíz de tu proyecto. Añade tus detalles de conexión a este archivo. La conexión a la base de datos es **obligatoria** para que la aplicación funcione.

    Ejemplo `.env.local`:
    ```dotenv
    # SQL Server Connection Details
    DB_SERVER=your_sql_server.database.windows.net
    DB_DATABASE=your_database_name
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_PORT=1433
    # Set DB_ENCRYPT to true if you are using Azure SQL or your SQL Server instance requires encryption.
    DB_ENCRYPT=true
    # Set DB_TRUST_SERVER_CERTIFICATE to true for local development if using a self-signed certificate.
    # For production, this should ideally be false, and your server should have a valid certificate.
    DB_TRUST_SERVER_CERTIFICATE=false
    ```
    
3.  **Configurar Esquema de Base de Datos y Datos Iniciales:**
    Para inicializar tu base de datos SQL Server para este proyecto, usa el script proporcionado. Este script crea las tablas necesarias (`Usuarios`, `Totes`, `Clientes`) y las puebla con datos de ejemplo.
    - El script se encuentra en `src/database/schema-and-sample-data.sql`.
    - Abre este archivo en SQL Server Management Studio (SSMS) o tu cliente SQL preferido.
    - Conéctate a tu base de datos.
    - Ejecuta el script.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

5.  **Ejecutar Genkit (para funciones de IA, en una terminal separada):**
    ```bash
    npm run genkit:dev
    ```
    Esto inicia el servidor de desarrollo de Genkit, necesario para la función de Insights de IA.

## Integración con SQL Server

-   **Consultas:** El servicio `src/lib/sqlserver-service.ts` y los archivos de acciones en `src/app/(app)/*/actions.ts` contienen las consultas SQL para obtener los datos. Si usaste el script `schema-and-sample-data.sql`, estas consultas deberían funcionar directamente. Si tienes una base de datos existente, es posible que necesites ajustar las consultas a tu esquema.

## Estructura del Proyecto

-   `src/app`: Contiene las páginas y layouts de Next.js (App Router).
-   `src/components`: Contiene componentes de UI reutilizables, incluyendo componentes ShadCN y componentes de layout personalizados.
-   `src/lib`: Contiene funciones de utilidad y servicios.
-   `src/data`: Contiene definiciones de tipos de datos.
-   `src/ai`: Contiene flujos de Genkit y configuraciones relacionadas con la IA.
-   `src/database`: Contiene scripts SQL para el esquema de la base de datos y datos de ejemplo.
-   `public`: Activos estáticos.

## Tecnologías Clave

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI
-   Genkit (para funciones de IA)
-   MSSQL (para integración con base de datos)
