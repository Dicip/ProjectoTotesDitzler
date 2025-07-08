# 🚀 DicipWare - Panel de Control (Versión de Demostración)

![Panel de Control de DicipWare](https://placehold.co/800x200.png?text=DicipWare+Dashboard)
*<p align="center">Una aplicación de demostración moderna, construida con Next.js y ShadCN UI.</p>*

---

## 🚧 ¡Atención! Esta es una Aplicación de Prueba

Este proyecto es una **demostración funcional** y una prueba de concepto (PoC) diseñada para mostrar las capacidades de un panel de control interactivo. No está conectada a una base de datos real y opera en un **modo offline**, utilizando el almacenamiento local del navegador (`localStorage`) para simular la persistencia de datos.

### Funcionalidades en Modo Demostración:

*   **Datos Persistentes Locales:** Todos los cambios que realices (crear, editar, eliminar) se guardarán en tu navegador. Si limpias los datos de tu navegador, la aplicación se restaurará al estado inicial.
*   **Usuarios de Ejemplo:** Puedes iniciar sesión con cualquiera de los siguientes usuarios (la contraseña es `123` para todos):
    *   `admin@dicipware.com` (Rol: Administrador)
    *   `ana.martinez@example.com` (Rol: Administrador)
    *   `carlos.gomez@example.com` (Rol: Editor)
    *   `jorge.diaz@example.com` (Rol: Visualizador)

---

## ✨ Tecnologías Clave

Este proyecto integra un conjunto de tecnologías modernas para ofrecer una experiencia de desarrollo y de usuario de primer nivel:

| Categoría         | Tecnología                                                               | Propósito                                       |
| ----------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| **Framework**     | [**Next.js 14**](https://nextjs.org/) (con App Router)                   | Renderizado híbrido (SSR/SSG/CSR) y enrutamiento. |
| **UI Library**    | [**React 18**](https://react.dev/)                                       | Construcción de interfaces de usuario interactivas. |
| **Lenguaje**      | [**TypeScript**](https://www.typescriptlang.org/)                        | Tipado estático para robustez y mantenibilidad.   |
| **Estilos**       | [**Tailwind CSS**](https://tailwindcss.com/)                             | Framework CSS de utilidad para diseño rápido.     |
| **Componentes**   | [**ShadCN UI**](https://ui.shadcn.com/)                                  | Componentes de UI accesibles y personalizables.   |
| **Iconos**        | [**Lucide React**](https://lucide.dev/)                                  | Biblioteca de iconos ligera y personalizable.     |
| **IA Generativa** | [**Genkit**](https://firebase.google.com/docs/genkit)                    | Toolkit para construir flujos de IA.              |
| **Formularios**   | [**React Hook Form**](https://react-hook-form.com/) & [**Zod**](https://zod.dev/) | Gestión y validación de formularios robusta.      |

---

## 🛠️ Cómo Empezar

Sigue estos pasos para ejecutar la aplicación en tu entorno local.

1.  **Instalar dependencias:**
    Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    npm install
    ```

2.  **Ejecutar el servidor de desarrollo:**
    Una vez instaladas las dependencias, inicia la aplicación:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

3.  **Ejecutar Genkit (Opcional, para funciones de IA):**
    Si deseas trabajar con las funcionalidades de IA, necesitarás ejecutar Genkit en una terminal separada:
    ```bash
    npm run genkit:dev
    ```

---

## 📂 Estructura del Proyecto

La organización del código está pensada para ser escalable y mantenible:

-   `src/app`: Contiene las páginas, layouts y rutas de la aplicación (usando el App Router de Next.js).
-   `src/components`: Componentes de React reutilizables, incluyendo los componentes de UI de ShadCN y componentes de layout personalizados.
-   `src/lib`: Funciones de utilidad, constantes y lógica de negocio central.
-   `src/data`: Definiciones de tipos de TypeScript y datos de demostración (`mock-data`).
-   `src/hooks`: Hooks personalizados de React para lógica reutilizable (ej. `use-local-storage`).
-   `src/ai`: (Reservado) Flujos de Genkit y configuraciones de IA.
-   `public`: Archivos estáticos como imágenes y fuentes.
