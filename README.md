<p align="center">
  <img src="https://social-badges.netlify.app/assets/images/logo.png" alt="UniService Logo" width="120">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square" alt="version"></a>
  <a href="#"><img src="https://img.shields.io/badge/database-SQL_Server_2025-red.svg?style=flat-square" alt="SQL Server"></a>
  <a href="#"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/status-active-brightgreen.svg?style=flat-square" alt="Status"></a>
</p>

<p align="center"><b>Convierte tu conocimiento en oportunidades. La plataforma segura para el intercambio estudiantil.</b></p>

<p align="center">
  <img src="https://img.freepik.com/free-vector/connected-world-concept-illustration_114360-3027.jpg" alt="UniService Banner" width="600">
</p>

---

## 🎓 ¿Qué es UniService?

**UniService** es una plataforma diseñada para profesionalizar el intercambio de servicios académicos y profesionales entre estudiantes universitarios. 

A diferencia de los grupos informales de redes sociales, UniService ofrece un entorno **institucional, seguro y organizado**. Aquí, los estudiantes pueden ofrecer tutorías, proyectos y asesorías con perfiles verificados y un sistema de calificaciones transparente.

### ✨ Características principales
- **Perfiles Verificados:** Seguridad y confianza para la comunidad.
- **Repositorio Académico:** Acceso a material y guías actualizadas.
- **Sistema de Calificaciones:** Retroalimentación real de usuarios.
- **Interfaz Moderna:** Diseñada específicamente para jóvenes universitarios.

---

## 🚀 Inicio Rápido

### Requisitos previos
- **Docker** (para contenedores) o **SQL Server 2025** instalado localmente.
- Cliente SQL (Azure Data Studio, SSMS).

### Configuración de la Base de Datos
Los scripts deben ejecutarse en orden alfabético desde la carpeta `./database`:

1.  `01_Create_Tables.sql`: Genera el esquema principal de la base de datos.
2.  `02_Procedures_Create.sql`: Implementa la lógica de negocio y procedimientos almacenados.

---

## 🔑 Credenciales de Conexión

Si estás configurando el entorno de desarrollo, utiliza los siguientes datos:

| Parámetro | Valor |
| :--- | :--- |
| **Motor** | SQL Server 2025 |
| **Host** | `localhost` (externo) / `sqlserver` (Docker) |
| **Puerto** | `1433` |
| **Usuario** | `sa` |
| **Password** | `Uniservicio58414555` |
| **Base de Datos** | `UniService` |

---

## 🗄️ Estructura del Proyecto

```bash
├── database/            # Scripts SQL (Tablas y Procedimientos)
├── src/                 # Código fuente de la aplicación
├── docs/                # Documentación técnica y diagramas
└── public/              # Assets, logos e imágenes