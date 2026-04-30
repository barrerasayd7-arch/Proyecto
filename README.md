<div align="center">
<br>
<!-- LOGO -->
<img src="./frontend\src\img\Logo+name_color_gnoBG_email.png" alt="UniServices Logo" width="700"/>
<!-- ESLOGAN -->
<h3><em>Convierte tu conocimiento en oportunidades.<br>La plataforma segura para el intercambio estudiantil.</em></h3>
<br><br>
<!-- BADGES ROW 1 -->
<img src="https://img.shields.io/badge/versión-1.2.5-6366F1?style=for-the-badge&logo=git&logoColor=white" alt="version"/>
<img src="https://img.shields.io/badge/estado-updating-10B981?style=for-the-badge&logo=checkmarx&logoColor=white" alt="updating"/>
<img src="https://img.shields.io/badge/licencia-MIT-F59E0B?style=for-the-badge" alt="licencia"/>
<br><br>
<!-- BADGES ROW 2 — STACK -->
<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/SQL_Server_2025-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white" alt="SQL Server"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
<img src="https://img.shields.io/badge/JSX-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JSX"/>
<br><br>


---
</div>

<h2 id="-sobre-uniservices">🎓 ¿Qué es UniServices?</h2>

**UniServices** es una plataforma institucional diseñada para profesionalizar el intercambio de servicios académicos y profesionales entre estudiantes universitarios. 

A diferencia de los grupos informales en redes sociales, ofrece un entorno **seguro y organizado** donde los estudiantes pueden publicar tutorías, proyectos y asesorías con perfiles verificados y un sistema de calificaciones transparente.

### ✨ Características principales
- **Perfiles Verificados:** Seguridad y confianza para la comunidad.
- **Repositorio Académico:** Acceso a material y guías actualizadas.
- **Sistema de Calificaciones:** Retroalimentación real entre usuarios.
- **Interfaz Moderna:** Experiencia optimizada para jóvenes universitarios.

<p align="center">
  <img src="./frontend/src/img/Img_Read_me.png" alt="UniService Banner" width="750" style="corner-radius: 10px;">
</p>

---

<h2 id="-estructura-del-repositorio">📂 Estructura del Repositorio</h2>

```bash
PROYECTO/
├── backend/                 # Lógica del Servidor (Node.js/Express)
│   ├── src/
│   │   ├── assets/          # Plantillas de correo (email.html) e imágenes de sistema
│   │   ├── config/          # Configuraciones (Base de datos, Mailer)
│   │   ├── controllers/     # Lógica de las rutas (auth.controller.js, etc.)
│   │   ├── img/             # Almacenamiento local de imágenes subidas
│   │   ├── middlewares/     # Funciones de validación y seguridad
│   │   ├── routes/          # Definición de end-points de la API
│   │   └── app.js           # Configuración de Express
│   ├── .env                 # Variables de entorno (Secretas)
│   ├── package.json         # Dependencias del Backend
│   └── server.js            # Punto de entrada del servidor (Entry point)
├── database/                # Scripts SQL y persistencia
├── frontend/                # Aplicación de Cliente (Vite + React)
│   ├── dist/                # Build para producción
│   ├── public/img/          # Imágenes estáticas accesibles por URL
│   ├── src/
│   │   ├── Components/      # Componentes reutilizables (Botones, Navbar)
│   │   ├── img/             # Imágenes usadas en el código JSX
│   │   ├── lib/             # Librerías o configuraciones de terceros
│   │   ├── Pages/           # Vistas principales (Login, Perfil, Home)
│   │   ├── styles/          # Archivos CSS
│   │   ├── utils/           # Funciones de ayuda (Helpers)
│   │   ├── App.jsx          # Enrutador principal
│   │   └── main.jsx         # Renderizado de React
│   ├── .env.example         # Plantilla de variables de entorno
│   ├── index.html           # Punto de entrada HTML
│   ├── MIGRACION_JSX.md     # Notas de cambios técnicos
│   ├── package.json         # Dependencias del Frontend
│   └── vite.config.js       # Configuración de Vite
├── docker-compose.yml       # Orquestación de contenedores
├── import-data.sh           # Script de carga masiva de datos
├── package.json             # Dependencias de nivel raíz (si existen)
└── README.md                # Documentación general
```

<h2 id="-tecnologías">🛠️ Tecnologías</h2>

Base de Datos: SQL Server 2025

Frontend: React / JSX + Vite

Arquitectura: Contenedores con Docker & Docker Compose

<h2 id="-instalación-y-uso">🚀 Instalación y Uso</h2>

1. Clonar el repositorio

1️⃣
```bash
git clone https://github.com/tu-usuario/UniServices.git
```
2️⃣
```bash
cd UniServices
```
2. Despliegue con Docker y NPM (En la carpeta raiz)

 ```bash
npm run dev
```
---
<h2 id="-contribuir">🤝 Contribuir</h2>

Si quieres ayudar a mejorar UniService:

Haz un Fork del proyecto.

Crea una rama para tu mejora (git checkout -b feature/MejoraIncreible).

Haz un commit de tus cambios (git commit -m 'Add some MejoraIncreible').

Haz un Push a la rama (git push origin feature/MejoraIncreible).

Abre un Pull Request.

---
---

<h2 align="center">
Hecho con ❤️ por y para estudiantes 🎓
</h2>