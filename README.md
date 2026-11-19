# Taller Solidario

Sistema de gestión de inventario para un taller dedicado a reparar notebooks y otros equipos para donar a espacios y organizaciones que lo necesiten. Proyecto desarrollado en el marco de la **Universidad Nacional de Córdoba (UNC)**, en la **Facultad de Matemática, Astronomía, Física y Computación (FaMAF)**, y pensado para uso interno del taller.

## Tech stack
- **React + Vite** — Frontend y build tool  
- **TypeScript** — Tipado estático  
- **Tailwind CSS** — Estilos utility-first  
- **shadcn/ui** — Componentes reutilizables (Radix + Tailwind)  
- **TanStack Query** — Fetching y caching asíncrono  
- **Zod** — Schemas y validación  
- **React Hook Form** — Formularios y validación  
- **Supabase** — Backend (base de datos + auth)  
- **Electron** — Empaquetado como aplicación de escritorio

## Estado y alcance
Proyecto frontend que se conecta directamente a Supabase. No exponer credenciales públicas de producción. Está orientado al uso por miembros autorizados del taller.

## Contribuciones
Las contribuciones **solo están permitidas a miembros autorizados del taller** con acceso a la cuenta de Supabase.  
- Los PRs fuera de la organización no serán aceptados.  
- Si no perteneces al taller, podés abrir *issues* para bugs o sugerencias y revisar el código con fines educativos.

## Comandos principales
```bash
# clonar e instalar
git clone https://github.com/MaxAg22/Taller-Solidario.git
cd Taller-Solidario
npm install

# ejecutar en modo desarrollo (web)
npm run dev

# ejecutar Electron en modo desarrollo
npm run electron:dev

# buildar y generar instalador
npm run dist

# ejecutar los tests
npm run test
```

## Tests

El proyecto usa **Vitest** para los tests unit e integración, y Playwright (o similar) para los tests E2E.

```bash
# correr todos los tests una vez
npm run test

# correr en modo watch (re-ejecuta al guardar cambios)
npx vitest

# correr un archivo específico
npx vitest run tests/unit/actions/orders.test.ts

# correr en un patrón (ej: todos los tests de actions)
npx vitest run tests/unit/actions/

# correr solo unit / solo integración
npx vitest run tests/unit/
npx vitest run tests/integration/
```

### Estructura

```
tests/
  unit/                       # lógica aislada: actions, utils, validators (sin DOM)
    supabase/mock.ts          # mock del cliente Supabase (cola de resultados, registro de llamadas)
    utils/                    # tests de utils (formatDeliveryDate, mapNotebook, etc.)
    validators/               # tests de schemas Zod (orderFormSchema, etc.)
    actions/                  # tests de actions (orders, notebooks, etc.) con Supabase mockeado
  integration/                # componentes React renderizados en jsdom (con hooks mockeados)
    setup.ts                  # import de jest-dom matchers + cleanup entre tests
    helpers/                  # renderWithProviders (QueryClientProvider + MemoryRouter)
    components/               # tests por componente (orders/, notebooks/, shared/, etc.)
    pages/                    # tests por página (OrdersPage, OrderDetailPage, etc.)
  e2e/                        # sistema completo: browser real + servidor + base (sin mocks)
    db/                       # tests de RPCs y lógica de base de datos
    app/                      # flujos de usuario end-to-end (navegar, interactuar, assert)
```

## Variables de entorno
Crear un .env (o .env.local) con las variables necesarias para conectarse a Supabase. Ejemplo (NO subir al repo):
```bash
VITE_PROJECT_URL_SUPABASE=https://tu-proyecto.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOi...
PROJECT_REF=...
```

## Cómo obtener las credenciales en Supabase

1. `VITE_PROJECT_URL_SUPABASE`: En el proyecto Supabase → Project Settings → Data API: copiar Project URL.
2. `VITE_SUPABASE_API_KEY`: En Project Settings → API o API Keys: copiar la anon public key (o la legacy anon si corresponde).
3. `PROJECT_REF`: Es la referencia del proyecto en Supabase (Project ID), se encuentra en Project Settings → General.

## Proyectos Supabase

- Taller-Solidario-Equipos → Producción (NO USAR para desarrollo)
- Taller-Solidario-Pruebas → Desarrollo

## Cambios en la base de datos y generación de tipos

Si modificás el esquema en Supabase, regenerá los tipos y reemplazá el archivo de tipos local:
En Supabase → API Docs → Tables and Views → Introduction.

1. Hacer click en Generate and download types.
2. Reemplazar supabase.js por el generado.

### Flujo de trabajo con el CLI de Supabase

Este proyecto usa el CLI de Supabase para aplicar migraciones y regenerar tipos. El flujo es el siguiente:

```bash
# 1. Iniciar sesión (solo la primera vez)
npx supabase login

# 2. Enlazar el proyecto a la base de datos remota (solo la primera vez en cada clon)
npx supabase link --project-ref <PROJECT_REF>

# 3. Verificar el estado del enlazado
npx supabase status

# 4. Aplicar migraciones pendientes a la base remota
npx supabase db push --remote

# 5. Regenerar los tipos TypeScript a partir del esquema remoto
npx supabase gen types typescript --linked --project-ref <PROJECT_REF>
```

**Notas:**
- El comando `supabase link` guarda el enlace en el **keychain del sistema operativo** (no en un archivo del proyecto). Por lo tanto, **cada máquina debe ejecutarlo una vez** después de clonar el repo. Si cambiás de máquina o borrás el keychain, deberás repetirlo.
- No confundir con la API key: el `PROJECT_REF` es un identificador corto de 20 caracteres, no es una credencial secreta. La API key sí es sensible y debe mantenerse en `.env`.
- La bandera `--remote` es necesaria en `db push` porque el CLI por defecto apunta a la base de datos local (Docker).

## Generar una API key de Google Drive

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) con el mail que tiene acceso al Drive del taller y creá o seleccioná un proyecto.
2. En **APIs y servicios → Biblioteca**, habilitá **Google Drive API**.
3. En **APIs y servicios → Credenciales → Crear credenciales → Clave de API**, generá la clave y restringila a **Google Drive API**.
