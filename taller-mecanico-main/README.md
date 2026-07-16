# AutoFix SpA — Sistema de Gestión de Taller Mecánico

Proyecto universitario. Sistema web para gestionar clientes, vehículos, órdenes de trabajo y reservas de un taller mecánico.

---

## Requisitos previos

Instalar lo siguiente antes de comenzar:

| Software   | Versión       | Descarga                              |
| ---------- | -------------- | ------------------------------------- |
| Java JDK   | 17 o superior  | https://adoptium.net                  |
| Maven      | 3.9 o superior | https://maven.apache.org/download.cgi |
| Node.js    | 18 o superior  | https://nodejs.org                    |
| PostgreSQL | 15 o superior  | https://www.postgresql.org/download   |

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/doChelson/taller-mecanico.git
cd taller-mecanico
```

### 2. Configurar PostgreSQL

1. Abrir **pgAdmin 4**
2. Conectarse al servidor PostgreSQL
3. Clic derecho en **Databases → Create → Database**
4. Nombre: `autofix_db` → **Save**

La contraseña del usuario `postgres` debe ser `postgres123`.
Si tu contraseña es diferente, editar esta línea en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=TU_CONTRASEÑA
```

### 3. Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

---

## Cómo ejecutar el proyecto

Necesitas **dos terminales abiertas al mismo tiempo**.

### Terminal 1 — Backend

```bash
cd backend
mvn spring-boot:run
```

Esperar hasta ver:

```
Started SignInApplication in X seconds
```

> Las tablas de la base de datos se crean automáticamente al arrancar por primera vez.

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

### Abrir en el navegador

```
http://localhost:5173
```

Ingresar con cualquier email y contraseña (ej: `admin@autofix.cl` / `1234`).

---

## Funcionalidades

- **Login** — acceso al sistema
- **Dashboard** — métricas generales: total clientes, vehículos, órdenes y reservas próximas
- **Clientes** — crear, editar, eliminar clientes y gestionar sus vehículos
- **Vehículos** — listado de todos los vehículos registrados
- **Órdenes de trabajo** — crear y filtrar órdenes por estado (CREADA / EN_PROCESO / FINALIZADA)
- **Reservas** — agendar y listar reservas por cliente y vehículo

---

## Estructura del proyecto

```
taller-mecanico/
├── backend/          ← Spring Boot + JPA + PostgreSQL
│   └── src/main/
│       ├── java/     ← Controllers, Services, Models, DTOs
│       └── resources/
│           └── application.properties
└── frontend/         ← React 18 + Vite + Tailwind CSS
    └── src/
        ├── api/      ← Llamadas centralizadas a la API
        ├── components/
        │   ├── ui/   ← Button, Input, Badge, Card, Table, Modal
        │   └── layout/ ← Sidebar, Header, Layout
        ├── context/  ← AuthContext
        └── pages/    ← Login, Dashboard, Clientes, Vehiculos, Ordenes, Reservas
```

---

## Stack tecnológico

**Backend:** Java 17, Spring Boot, Spring Data JPA, PostgreSQL
**Frontend:** React 18, Vite, React Router v6, Tailwind CSS v4
