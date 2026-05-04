<h1 align="center">Contribuyendo a UniService 🎓</h1>

<p align="center">
  <strong>Conectando el talento estudiantil en Valledupar, Cesar.</strong><br>
  Gracias por tu interés en colaborar. Este documento define los estándares para mantener la calidad y el propósito de UniService.
</p>

<hr />

<h2>🛠️ Configuración del Entorno</h2>

<h3>Requisitos Previos</h3>
<ul>
  <li><strong>Node.js</strong> (v18 o superior)</li>
  <li><strong>Docker & Docker Compose</strong> (Para la base de datos SQL Server)</li>
  <li><strong>Git</strong></li>
</ul>

<h3>Instalación Rápida</h3>
<ol>
  <li><strong>Fork</strong> del repositorio y clonación local:
    <pre><code>git clone https://github.com/TU_USUARIO/Proyecto.git</code></pre>
  </li>
  <li><strong>Instalación masiva:</strong> Desde la raíz del proyecto, instala todas las dependencias (Backend y Frontend) con el script automatizado:
    <pre><code>npm run install-all</code></pre>
  </li>
</ol>

<hr />

<h2>💻 Flujo de Trabajo y Desarrollo</h2>

<h3>Ejecución con un solo comando</h3>
<p>Contamos con un script en la raíz que lanza simultáneamente el servidor <strong>Backend</strong> (Nodemon) y el <strong>Frontend</strong> (Vite):</p>
<pre><code>npm run dev</code></pre>

<h3>Orquestación de Infraestructura</h3>
<p>Si necesitas levantar la base de datos MSSQL y los servicios en contenedores:</p>
<pre><code>docker-compose up --build</code></pre>

<hr />

<h2>📦 Stack Tecnológico</h2>

<table>
  <tr>
    <th>Capa</th>
    <th>Tecnologías Principales</th>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>Express 5.2.1, MSSQL, JWT, Bcryptjs, Nodemailer</td>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React 18.3.1, Vite, React Router Dom 7.1.4, Axios</td>
  </tr>
  <tr>
    <td><strong>Visualización</strong></td>
    <td>Chart.js, React Datepicker</td>
  </tr>
</table>

<hr />

<h2>📏 Estándares de Código</h2>

<ul>
  <li><strong>Controladores:</strong> Añade lógica de negocio en <code>backend/src/controllers/</code>.</li>
  <li><strong>Componentes:</strong> Crea componentes reutilizables en <code>frontend/src/Components/</code>.</li>
  <li><strong>Assets:</strong> Guarda imágenes y plantillas de correo en <code>backend/src/assets/</code>.</li>
</ul>

<h3>Convenciones de Git</h3>
<p>Utilizamos <strong>Conventional Commits</strong> para un historial limpio:</p>
<ul>
  <li><code>feat:</code> Nueva funcionalidad.</li>
  <li><code>fix:</code> Corrección de errores.</li>
  <li><code>docs:</code> Cambios en documentación.</li>
  <li><code>style:</code> Ajustes visuales (CSS/Layout).</li>
</ul>

<hr />

<h2>📧 Plantillas de Correo y Seguridad</h2>
<p>Al trabajar con el sistema de autenticación de <strong>UniService</strong>:</p>
<ol>
  <li>Modifica el HTML en <code>backend/src/assets/email.html</code>.</li>
  <li>Usa el marcador <code>{{codigo}}</code> para la inyección de códigos dinámicos.</li>
  <li>Las imágenes deben referenciarse mediante <strong>CID</strong> (<code>cid:logo_uniservice</code>).</li>
</ol>

<hr />

<h2>🚀 Pull Requests (PRs)</h2>
<ul>
  <li>Describe los cambios realizados y su impacto funcional.</li>
  <li>Adjunta capturas de pantalla si hay cambios en la interfaz (React).</li>
  <li>Se requiere al menos <strong>una aprobación</strong> de los mantenedores principales.</li>
</ul>

---

<h2 id="-estructura-del-repositorio">📂 Estructura del Repositorio</h2>

```bash
UniService/
├── backend/                         # Lógica del servidor
│   │
│   └── UniserviceAPI/               # Proyecto principal del backend
│       ├── Controllers/             # Endpoints de la API
│       ├── Data/                    # Acceso a datos y persistencia
│       ├── DTOs/                    # Objetos de transferencia de datos
│       ├── Models/                  # Entidades y modelos del sistema
│       ├── UniserviceAPI.sln        # Archivo de solución de Visual Studio
│       ├── Properties/              # Configuraciones de lanzamiento
│       ├── Services/                # Lógica de negocio
│       ├── wwwroot/                 # Carpeta pública para archivos estáticos
│       ├── appsettings.json         # Configuración y secretos
│       ├── Program.cs               # Configuración del pipeline y servicios
│       └── UniserviceAPI.csproj     # Archivo de proyecto de C#
│
├── frontend/                        # Aplicación cliente
│   ├── public/                      # Assets estáticos del navegador
│   │
│   ├── src/                         # Código fuente de React
│   │   ├── Components/              # Componentes de interfaz reutilizables
│   │   ├── Pages/                   # Vistas principales de la aplicación
│   │   ├── styles/                  # Hojas de estilo CSS
│   │   ├── utils/                   # Funciones auxiliares y constantes
│   │   ├── App.jsx                  # Enrutador principal
│   │   └── main.jsx                 # Punto de entrada de React
│   │
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── index.html                   # Punto de entrada HTML
│   ├── MIGRACION_JSX.md             # Documentación de migración técnica
│   ├── package.json                 # Gestión de dependencias y scripts
│   └── vite.config.js               # Configuración de Vite
│
├── database/                        # Scripts y respaldos de SQL
├── docker-compose.yml               # Orquestación de contenedores
├── README.md                        # Guía general del proyecto
├── SECURITY.md                      # Políticas de seguridad
├── CONTRIBUTING.md                  # Guía de contribución
└── CODE_OF_CONDUCT.md               # Código de conducta
```



<p align="center">
  <sub><strong>UniService</strong> - Construido por estudiantes para transformar la vida universitaria.</sub>
</p>