
# Firebase Studio

Este es un proyecto de demostración de NextJS en Firebase Studio.

Para empezar, echa un vistazo a /src/app/page.tsx.

## Modo Demostración (Offline)

Esta aplicación está configurada para funcionar exclusivamente en modo de demostración (offline), utilizando datos de ejemplo internos en lugar de conectarse a una base de datos real.

**Funcionalidades en modo demostración:**
- Las funciones para agregar, editar o eliminar registros están deshabilitadas.
- Podrá iniciar sesión con el usuario `adm` (contraseña `123`) o con cualquiera de los siguientes usuarios de ejemplo (cualquier contraseña funcionará):
  - `ana.martinez@example.com` (Admin)
  - `carlos.gomez@example.com` (Editor)
  - `jorge.diaz@example.com` (Viewer)

## Ejecución de la Aplicación

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

3.  **Ejecutar Genkit (para funciones de IA, en una terminal separada):**
    ```bash
    npm run genkit:dev
    ```

## Estructura del Proyecto

-   `src/app`: Contiene las páginas y layouts de Next.js (App Router).
-   `src/components`: Contiene componentes de UI reutilizables.
-   `src/lib`: Contiene funciones de utilidad y servicios.
-   `src/data`: Contiene definiciones de tipos y datos de demostración.
-   `src/ai`: Contiene flujos de Genkit y configuraciones de IA.
-   `public`: Activos estáticos.

## Tecnologías Clave

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI
-   Genkit (para IA)

DicipWare 