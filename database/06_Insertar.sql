USE UniService;
GO

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================
-- 1. POBLAR USUARIOS
-- =============================================
INSERT INTO usuarios (telefono, password_hash, nombre, descripcion, correo, universidad)
VALUES 
(N'3043307911', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Sayd', N'Estudiante de Ingenieria de sistemas Universidad Popular del Cesar', N'barrerasayd7@gmail.com', 'Universidad Popular del Cesar'),
(N'3117906271', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Lenin', N'Estudiante de Ingenieria de sistemas Universidad Popular del Cesar', N'leninrys1218@gmail.com', 'Universidad Popular del Cesar'),
(N'3001234567', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Camilo', N'Estudiante de Ingeniería de Sistemas UPC', N'camilo.sist@gmail.com', 'Universidad Pontificia Comillas'),
(N'3012345678', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Valentina', N'Estudiante de Derecho - Séptimo Semestre', N'valen_upc@gmail.com', 'Universidad Pontificia Comillas'),
(N'3109876543', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Andrés', N'Monitor de Matemáticas y Física', N'andres_monitor@gmail.com', 'Universidad Pontificia Comillas'),
(N'3156789012', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Mariana', N'Apasionada por la programación en Python y React', N'mariana_dev@gmail.com', 'Universidad Pontificia Comillas'),
(N'3204567890', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Mateo', N'Estudiante de Contaduría Pública', N'mateo.contable@gmail.com', 'Universidad Pontificia Comillas'),
(N'3009998877', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Daniela', N'Líder del grupo de investigación de software', N'daniela_inv@gmail.com', 'Sin universidad'),
(N'3112223344', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Sebastian', N'Estudiante de Ing. Electrónica', N'sebas_elec@gmail.com', 'Sin universidad'),
(N'3183334455', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Paula', N'Estudiante de Psicología UPC', N'paula.psi@gmail.com', 'Sin universidad'),
(N'3045556677', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Santiago', N'Interesado en redes y ciberseguridad', N'santiago_net@gmail.com', 'Sin universidad'),
(N'3127778899', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Gabriela', N'Estudiante de Licenciatura en Idiomas', N'gabi.languages@gmail.com', 'Universidad Pontificia Comillas'),
(N'3210001122', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Nicolas', N'Freelance dev y estudiante de sistemas', N'nico_dev_upc@gmail.com', 'Universidad Pontificia Comillas'),
(N'3051112233', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Isabella', N'Estudiante de Administración de Empresas', N'isabella_admin@gmail.com', 'Sin universidad'),
(N'3162223344', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Julian', N'Especialista en bases de datos SQL', N'julian.sql@gmail.com', 'Sin universidad'),
(N'3174445566', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Elena', N'Estudiante de Ingeniería Ambiental', N'elena_ambiental@gmail.com', 'Sin universidad'),
(N'3028889900', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Diego', N'Entusiasta de la IA y el Machine Learning', N'diego_ia@gmail.com', 'Sin universidad'),
(N'3136667788', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Sara', N'Estudiante de Economía', N'sara_econ@gmail.com', 'Sin universidad'),
(N'3005554433', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Felipe', N'Desarrollador backend junior', N'felipe_back@gmail.com', 'Universidad Pontificia Comillas'),
(N'3141110099', N'$2y$10$n.QB9K1ni2zC/zjJGKcfaufpqQjeAE8Nx.gbW/U36aRyjFqecG7RO', N'Lucía', N'Estudiante de Sociología', N'lucia_soc@gmail.com', 'Sin universidad');

-- =============================================
-- 2. POBLAR CATEGORÍAS
-- =============================================
INSERT INTO categorias (nombre_categoria)
VALUES 
(N'Tutorías'), 
(N'Ensayos y redacción'), 
(N'Proyectos'), 
(N'Programación'), 
(N'Diseño'), 
(N'Arriendo de habitaciones'), 
(N'Otros servicios');

-- =============================================
-- 3. POBLAR SEGUIDORES (RED SOCIAL)
-- =============================================
INSERT INTO seguidores (id_seguidor, id_seguido)
VALUES 
-- El grupo de Ingeniería (Sayd, Lenin, Camilo, Andrés, Mariana, Sebastian, Julian, Nicolas, Diego, Felipe)
(1, 3), (3, 1),                 -- Sayd y Camilo
(2, 4), (4, 2),                 -- Lenin y Valentina
(3, 5), (5, 3),                 -- Camilo y Andrés
(4, 6), (6, 4),                 -- Valentina y Mariana
(1, 13), (13, 1),               -- Sayd y Julian (Bases de Datos)
(13, 11), (11, 13),             -- Julian y Nicolas
(15, 1), (1, 15),               -- Diego y Sayd (IA y Sistemas)
(17, 3), (3, 17),               -- Felipe y Camilo

-- El grupo de Humanidades y Ciencias (Paula, Gabriela, Isabella, Elena, Sara, Lucía)
(8, 10), (10, 8),               -- Paula (Psicología) y Gabriela (Idiomas)
(10, 12), (12, 10),             -- Gabriela e Isabella (Admin)
(18, 8), (8, 18),               -- Lucía (Socio) y Paula
(14, 17), (17, 14),             -- Elena (Ambiental) y Felipe

-- Seguimientos aleatorios por servicios (clientes siguiendo a proveedores)
(5, 1),                         -- Andrés sigue a Sayd (por Desarrollo Web)
(7, 2),                         -- Mateo sigue a Lenin (por Tutoría Cálculo)
(9, 4),                         -- Santiago sigue a Valentina (por Derecho)
(12, 17),                       -- Isabella sigue a Felipe (por Arriendo)
(16, 3),                        -- Sara sigue a Camilo (por SQL)
(6, 11),                        -- Mariana sigue a Nicolas (por Flutter)
(2, 15),                        -- Lenin sigue a Diego (por IA)
(4, 9);                         -- Valentina sigue a Santiago (por Diseño)

-- =============================================
-- 4. SERVICIOS INICIALES
-- =============================================

INSERT INTO servicios (id_proveedor, titulo, descripcion, id_categoria, precio_hora, contacto, modalidad, icono, disponibilidad)
VALUES 
-- Programación (ID 4)
(3, N'Bases de Datos SQL', N'Diseño de diagramas ER y consultas complejas', 4, 40000.00, N'3001234567', 1, N'🗄️', 1),
(4, N'Scripts en Python', N'Automatización de tareas y análisis de datos', 4, 30000.00, N'3012345678', 1, N'🐍', 1),
(11, N'App Móvil con Flutter', N'Desarrollo de prototipos para Android/iOS', 4, 120000.00, N'3210001122', 1, N'📱', 1),
(13, N'Corrección de Bugs Java', N'Debug de proyectos universitarios en Java', 4, 20000.00, N'3162223344', 1, N'👾', 1),

-- Tutorías (ID 1)
(5, N'Clases de Álgebra Lineal', N'Vectores, matrices y espacios vectoriales', 1, 15000.00, N'3109876543', 0, N'📐', 1),
(8, N'Tutoría de Psicología', N'Apoyo en teorías del aprendizaje', 1, 18000.00, N'3183334455', 0, N'🧠', 1),
(10, N'Clases de Inglés B1', N'Práctica de conversación y gramática', 1, 25000.00, N'3127778899', 0, N'🇺🇸', 1),
(16, N'Tutoría de Microeconomía', N'Curvas de oferta, demanda y equilibrio', 1, 22000.00, N'3136667788', 0, N'📈', 1),
(15, N'Tutoría de Física II', N'Termodinámica y electromagnetismo', 1, 30000.00, N'3028889900', 0, N'⚡', 1),

-- Ensayos y Redacción (ID 2)
(2, N'Corrección de Estilo APA', N'Ajuste de normas APA 7ma edición para tesis', 2, 10000.00, N'3117906271', 1, N'✍️', 1),
(18, N'Redacción de Ensayos', N'Textos argumentativos sobre sociología', 2, 25000.00, N'3141110099', 1, N'📝', 1),
(12, N'Traducción de Resúmenes', N'Traducción técnico-académica (Inglés/Español)', 2, 12000.00, N'3051112233', 1, N'🌐', 1),

-- Proyectos (ID 3)
(6, N'Plan de Negocios', N'Estructuración de proyectos de emprendimiento', 3, 50000.00, N'3156789012', 1, N'💼', 1),
(14, N'Asesoría Ambiental', N'Informes de impacto y gestión de residuos', 3, 45000.00, N'3174445566', 1, N'🌱', 1),
(7, N'Análisis Estadístico', N'Procesamiento de datos en Excel o SPSS', 3, 35000.00, N'3204567890', 1, N'📊', 1),

-- Diseño (ID 5)
(9, N'Logotipos para Proyectos', N'Diseño de identidad visual para startups', 5, 60000.00, N'3045556677', 1, N'🎨', 1),
(1, N'Edición de Video', N'Montaje para redes sociales y presentaciones', 5, 40000.00, N'3043307911', 1, N'🎬', 1),
(4, N'Diseño de Diapositivas', N'Presentaciones interactivas en Canva', 5, 15000.00, N'3012345678', 1, N'✨', 1),

-- Arriendo de habitaciones (ID 6)
(17, N'Habitación Central', N'Cerca a la UPC, incluye servicios y WiFi', 6, 450000.00, N'3005554433', 0, N'🏠', 1),
(12, N'Aparto-estudio Estudiantes', N'Entrada independiente y baño privado', 6, 600000.00, N'3051112233', 0, N'🔑', 1),
(5, N'Cupo Universitario', N'Habitación compartida, ambiente tranquilo', 6, 300000.00, N'3109876543', 0, N'🛌', 1),

-- Otros servicios (ID 7)
(3, N'Mantenimiento de PC', N'Limpieza física y cambio de pasta térmica', 7, 50000.00, N'3001234567', 1, N'🔧', 1),
(10, N'Venta de Almuerzos', N'Comida casera con domicilio en el campus', 7, 12000.00, N'3127778899', 0, N'🍱', 1),
(8, N'Asesoría Nutricional', N'Planes de alimentación para estudiantes', 7, 30000.00, N'3183334455', 0, N'🍎', 1),
(15, N'Reparación de Celulares', N'Cambio de pantallas y baterías', 7, 80000.00, N'3028889900', 1, N'🛠️', 1),
(6, N'Venta de Accesorios', N'Cables USB, audífonos y protectores', 7, 15000.00, N'3156789012', 1, N'🎧', 1),
(13, N'Formateo de Laptops', N'Instalación de Windows y Office', 7, 45000.00, N'3162223344', 1, N'💿', 1),
(11, N'Fotografía para Eventos', N'Sesiones fotográficas académicas', 7, 100000.00, N'3210001122', 1, N'📸', 1);

-- =============================================
-- 5. POBLAR SOLICITUDES (TRANSACCIONES)
-- =============================================
INSERT INTO solicitudes (id_cliente, id_proveedor, id_servicio, fue_aceptada)
VALUES 
-- Solicitudes de Programación y Proyectos (Altas probabilidades de ser aceptadas)
(3, 11, 3, 1),  -- Camilo solicita App Móvil a Nicolas
(11, 1, 1, 1),  -- Nicolas solicita React a Sayd
(15, 13, 4, 1), -- Diego solicita Debug Java a Julian
(1, 3, 1, 1),   -- Sayd solicita SQL a Camilo
(17, 4, 2, 0),  -- Felipe solicita Python a Valentina (Pendiente)

-- Solicitudes de Tutorías
(5, 2, 2, 1),   -- Andrés solicita Cálculo a Lenin
(8, 10, 7, 1),  -- Paula solicita Inglés a Gabriela
(16, 5, 5, 0),  -- Sara solicita Álgebra a Andrés (Pendiente)
(10, 16, 8, 1), -- Gabriela solicita Microeconomía a Sara
(2, 15, 9, 0),  -- Lenin solicita Física a Diego (Pendiente)

-- Solicitudes de Redacción y Diseño
(18, 2, 10, 1), -- Lucía solicita Normas APA a Lenin
(12, 18, 11, 1),-- Isabella solicita Ensayos a Lucía
(9, 4, 18, 1),  -- Santiago solicita Diapositivas a Valentina
(4, 9, 16, 0),  -- Valentina solicita Logo a Santiago (Pendiente)
(7, 1, 17, 1),  -- Mateo solicita Edición Video a Sayd

-- Solicitudes de Arriendo (Categoría 6)
(5, 17, 19, 1),  -- Andrés solicita Habitación a Felipe
(10, 12, 20, 0), -- Gabriela solicita Aparto-estudio a Isabella (Pendiente)
(14, 5, 21, 1),  -- Elena solicita Cupo a Andrés

-- Otros Servicios (Varios)
(1, 10, 23, 1),  -- Sayd solicita Almuerzo a Gabriela
(3, 8, 24, 0),   -- Camilo solicita Nutrición a Paula (Pendiente)
(6, 15, 25, 1),  -- Mariana solicita Reparación Celular a Diego
(13, 6, 26, 1),  -- Julian solicita Accesorios a Mariana
(11, 13, 27, 0), -- Nicolas solicita Formateo a Julian (Pendiente)
(8, 11, 28, 1),  -- Paula solicita Fotografía a Nicolas
(12, 3, 22, 1),  -- Isabella solicita Mantenimiento PC a Camilo
(7, 10, 23, 1),  -- Mateo solicita Almuerzo a Gabriela
(18, 12, 12, 1), -- Lucía solicita Traducción a Isabella
(4, 1, 1, 1);    -- Valentina solicita React a Sayd

-- =============================================
-- 6. POBLAR CALIFICACIONES (RESEÑAS)
-- =============================================
INSERT INTO calificaciones (id_solicitud, id_cliente, id_servicio, puntuacion, comentario)
VALUES 
-- Calificaciones para Programación (Excelentes)
(3, 3, 3, 5, N'Excelente manejo de SQL, me salvó el proyecto de bases de datos.'),
(4, 4, 4, 5, N'El script de Python funcionó perfecto, muy rápido.'),
(11, 11, 3, 4, N'Muy buen diseño de interfaces, aunque demoró un poquito en la entrega.'),
(13, 15, 4, 5, N'Encontró el error en mi código Java en 10 minutos. Recomendado.'),
(28, 4, 1, 5, N'La interfaz en React quedó súper moderna, justo lo que buscaba.'),

-- Calificaciones para Tutorías
(6, 5, 2, 5, N'Explica el Cálculo Integral mucho mejor que el profesor, 10/10.'),
(7, 8, 7, 4, N'Muy buena la clase de inglés, me ayudó mucho con la pronunciación.'),
(9, 10, 8, 5, N'Domina totalmente el tema de microeconomía. Muy paciente.'),
(19, 1, 23, 5, N'El almuerzo estaba delicioso y calientico, gran servicio en la U.'),
(27, 18, 12, 4, N'La traducción técnica fue muy precisa, me sirvió para el abstract.'),

-- Calificaciones para Servicios Varios y Arriendo
(16, 5, 19, 5, N'La habitación es tal cual las fotos, muy cerca de la sede Sabanas.'),
(18, 14, 21, 4, N'Ambiente muy tranquilo para estudiar, el WiFi vuela.'),
(21, 6, 25, 3, N'Arregló el celular, pero la pantalla no quedó del todo centrada.'),
(22, 13, 26, 5, N'Los audífonos son originales y a buen precio.'),
(24, 8, 28, 5, N'Las fotos para mi grado quedaron increíbles, muy profesional.'),

-- Más calificaciones aleatorias
(12, 18, 10, 5, N'Me dejó el ensayo con normas APA perfecto, sin errores.'),
(15, 7, 17, 4, N'Buen editor de video, entendió rápido la idea.'),
(25, 12, 22, 5, N'Mi laptop quedó como nueva después del mantenimiento.'),
(26, 7, 23, 5, N'Puntual con la entrega del almuerzo en la biblioteca.'),
(2, 2, 1, 2, N'No pudimos concretar la hora, pero fue amable.'),
(8, 16, 5, 4, N'Las clases de álgebra me ayudaron a pasar el parcial.'),
(5, 1, 3, 5, N'El diagrama de base de datos quedó muy bien organizado.'),
(14, 9, 18, 4, N'Las diapositivas en Canva quedaron muy estéticas.'),
(20, 3, 24, 3, N'La asesoría fue buena, pero un poco costosa para ser estudiante.'),
(10, 2, 15, 5, N'Física II es difícil, pero con esta tutoría se entiende todo.'),
(17, 10, 20, 5, N'El aparto-estudio es muy seguro y el sector es bueno.'),
(23, 11, 27, 4, N'Formateo rápido y dejó todos los drivers instalados.'),
(1, 1, 2, 5, N'El mejor tutor de la UPC, sin duda alguna.');

-- =============================================
-- 7. ASPECTOS DESTACADOS
-- =============================================
INSERT INTO aspectos_destacados (id_calificacion, tipo_aspecto)
VALUES 
(1, 'Puntualidad'),
(1, 'Calidad'),
(1, 'Comunicación'),
(1, 'Precio justo');

GO