
# TaskManager Backend

Este repositorio contiene el backend de un **Task Manager** construido con **NestJS**, que utiliza **PostgreSQL** como base de datos y **Prisma** como ORM. Además, implementa autenticación con JWT, validación de datos con Zod, encriptación con bcrypt, compresión de respuestas y comunicación en tiempo real mediante Socket.io para la gestión de colaboradores.

## El archivo .env esta presente en root y accesible para pruebas (no incluido en .gitignore).

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Instalar PostgreSQL](#instalar-postgresql)
  - [Crear la Base de Datos](#crear-la-base-de-datos)
  - [Iniciar el Proyecto](#iniciar-el-proyecto)
  - [Uso con Docker](#uso-con-docker)
- [Endpoints Principales](#endpoints-principales)
- [Flujo de Autenticación y Uso](#flujo-de-autenticación-y-uso)
- [Pruebas](#pruebas)
- [Consideraciones Técnicas](#consideraciones-técnicas)
- [Notas Finales](#notas-finales)

## Características

- **Gestión de Tareas:** Los usuarios pueden crear, editar, eliminar y actualizar el estado de sus tareas.
- **Autenticación y Seguridad:** Registro e inicio de sesión obligatorios (authwall) con validación de contraseñas seguras y generación de tokens Bearer (válidos por 5 horas). Al hacer logout, el token se invalida.
- **Colaboración en Tiempo Real:** Invitaciones de colaboración gestionadas con Socket.io. El colaborador recibe un modal para aceptar o rechazar la invitación. Si acepta, accede a una vista propia para actualizar el estado de las tareas mediante drag & drop.
- **Pruebas:** Se utilizan **Jest** y **Supertest** para tests unitarios e integración, asegurando la robustez del proyecto.

## Tecnologías

- **Backend:** [NestJS](https://nestjs.com)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org)
- **ORM:** [Prisma](https://www.prisma.io)
- **Validación:** [Zod](https://zod.dev)
- **Autenticación:** JWT (con Passport)
- **Encriptación:** bcrypt
- **Realtime:** Socket.io
- **Testing:** Jest, Supertest
- **Gestión de Dependencias:** [Yarn](https://yarnpkg.com)
- **Otros:** Compression, Docker

## Requisitos

- [Node.js](https://nodejs.org) (versión recomendada >= 14)
- [Yarn](https://yarnpkg.com)
- [PostgreSQL](https://www.postgresql.org) instalado en el sistema
- Opcional: [Docker](https://www.docker.com)

## Instalación y Configuración

### Instalar PostgreSQL

#### Windows

1. Descarga el instalador desde la [página oficial de PostgreSQL](https://www.postgresql.org/download/windows/).
2. Sigue las instrucciones del instalador y asegúrate de instalar también la herramienta `psql`.
3. Una vez instalado, abre la terminal de PostgreSQL.

#### Linux

1. En distribuciones basadas en Debian/Ubuntu, ejecuta:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

#### Mac

1. Utiliza Homebrew:
   ```bash
   brew update
   brew install postgresql
   ```
2. Inicia el servicio:
   ```bash
   brew services start postgresql
   ```

### Crear la Base de Datos

Con PostgreSQL instalado, crea la base de datos local ejecutando el siguiente comando:

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE lemonbe;"
```

### Iniciar el Proyecto

1. Clona el repositorio y navega hasta la carpeta del proyecto.
2. Instala las dependencias (se utiliza Yarn):
   ```bash
   yarn install
   ```
3. Sincroniza el esquema de la base de datos con Prisma:
   ```bash
   npx prisma db push
   ```
4. Levanta el servidor en modo desarrollo:
   ```bash
   yarn dev
   ```
   El backend se ejecutará en: `http://localhost:4000`

### Uso con Docker

Si prefieres levantar el proyecto utilizando Docker, ejecuta:

```bash
docker-compose up --build
```

Importante: Este comando levanta todo el proyecto con un solo comando, excepto la base de datos. Deberás crear la base de datos manualmente y pushear el schema (con `npx prisma db push`) antes de utilizar el FE y BE.

## Endpoints Principales

### Autenticación

- `POST /auth/register`: Registra un nuevo usuario.
- `POST /auth/login`: Inicia sesión y genera un token Bearer.
- `POST /auth/logout`: Cierra la sesión y revoca el token.

### Tareas

- `POST /tasks`: Crea una nueva tarea.
- `GET /tasks`: Lista las tareas (se puede filtrar por `ownerId`).
- `PUT /tasks/:id`: Actualiza una tarea.
- `DELETE /tasks/:id`: Elimina una tarea.

### Colaboradores

- `POST /collaborators`: Envía una invitación para colaborar.
- `POST /collaborators/accept`: Acepta una invitación.
- `POST /collaborators/reject`: Rechaza una invitación.
- `GET /collaborators`: Lista los colaboradores.
- `DELETE /collaborators/leave`: El colaborador abandona la relación.
- `DELETE /collaborators/:collaboratorId`: El dueño elimina a un colaborador.

### Notificaciones

- `GET /notifications/test`: Prueba de notificaciones vía Socket.io.

## Pruebas

Se utilizan Jest y Supertest para garantizar la calidad del código mediante tests unitarios e integración. Con solo ejecutar:

```bash
yarn test
```

Se ejecutarán las pruebas y se mostrará la cobertura, ya que el script de pruebas está configurado para arrojar los `cov`.

## Consideraciones Técnicas

- **Compresión:** Se utiliza `compression` para mejorar el rendimiento de las respuestas HTTP.
- **Validación de Datos:** Se implementa con Zod (mediante DTOs validados) para garantizar que la información enviada cumple con los requisitos.
- **Seguridad:** 
  - Las contraseñas se encriptan usando bcrypt.
  - El sistema de tokens JWT utiliza un campo `tokenVersion` para invalidar tokens antiguos en caso de logout o nuevos inicios de sesión.
- **Realtime:** La comunicación en tiempo real (invitaciones y notificaciones) se gestiona a través de Socket.io.
- **Docker:** Se proporciona un `docker-compose.yml` para levantar el entorno de desarrollo de forma integrada (exceptuando la base de datos).
