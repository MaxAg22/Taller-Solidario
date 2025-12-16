# Taller Solidario

Sistema de gestión de inventario para un taller dedicado a reparar notebooks y otros equipos para donar a espacios y organizaciones que lo necesiten. Proyecto pensado para uso interno del taller.

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
```

## Variables de entorno
Crear un .env (o .env.local) con las variables necesarias para conectarse a Supabase. Ejemplo (NO subir al repo):
```bash
VITE_PROJECT_URL_SUPABASE=https://tu-proyecto.supabase.co
VITE_SUPABASE_API_KEY=eyJhbGciOi...
```

## Proyectos Supabase

- Taller-Solidario-Equipos → Producción (NO USAR para desarrollo)
- Taller-Solidario-Pruebas → Desarrollo

## Cómo obtener las credenciales en Supabase

1. En el proyecto Supabase → Project Settings → Data API: copiar Project URL → asignar a VITE_PROJECT_URL_SUPABASE.
2. En Project Settings → API o API Keys: copiar la anon public key (o la legacy anon si corresponde) → asignar a VITE_SUPABASE_API_KEY.

## Cambios en la base de datos y generación de tipos

Si modificás el esquema en Supabase, regenerá los tipos y reemplazá el archivo de tipos local:
En Supabase → API Docs → Tables and Views → Introduction.

1. Hacer click en Generate and download types.
2. Reemplazar supabase.js por el generado.

