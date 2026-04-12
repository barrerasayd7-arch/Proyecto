/////hacer codigo para buscar servicios por filtro de categoria, nombre o descripcion. El resultado se muestra en la consola.
console.log("explorarServicios cargado");
// explorarServicios.js

let serviciosTotales = [];
let serviciosFiltrados = [];
let categoriaActual = "todos";

/* =========================
   CARGAR SERVICIOS AL ENTRAR
========================= */
document.addEventListener("DOMContentLoaded", () => {
    cargarServiciosExplorar();
});

/* =========================
   TRAER SERVICIOS DESDE API
========================= */
function cargarServiciosExplorar() {
    fetch("http://localhost/api/crud/Servicios_Crud.php")
        .then(response => response.json())
        .then(data => {
            serviciosTotales = data.reverse(); // más recientes primero
            serviciosFiltrados = [...serviciosTotales];

            renderizarServicios(serviciosFiltrados);
        })
        .catch(error => {
            console.error("Error cargando servicios:", error);

            const contenedor = document.getElementById("contenedor-explorar");
            contenedor.innerHTML = `
                <p class="texto-muted" style="text-align:center; width:100%;">
                    No se pudieron cargar los servicios.
                </p>
            `;
        });
}

/* =========================
   RENDERIZAR TARJETAS
========================= */
function renderizarServicios(lista) {
    const contenedor = document.getElementById("contenedor-explorar");
    const totalResultados = document.getElementById("total-resultados");

    contenedor.innerHTML = "";
    totalResultados.textContent = lista.length;

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <p class="texto-muted" style="text-align:center; width:100%;">
                No se encontraron servicios con esos filtros.
            </p>
        `;
        return;
    }

    lista.forEach(servicio => {
        const estrellasTexto =
            typeof calcularEstrellas === "function"
                ? calcularEstrellas(servicio.estrellas)
                : "☆☆☆☆☆";

        const numReseñas = Array.isArray(servicio.estrellas)
            ? servicio.estrellas.length
            : 0;

        let descripcion = servicio.descripcion || "Sin descripción";

        if (descripcion.length > 90) {
            descripcion = descripcion.substring(0, 90) + "...";
        }

        const universidadTexto =
            servicio.universidad == 1
                ? "Universidad Popular del Cesar"
                : servicio.universidad || "Universidad no especificada";

        const tarjeta = `
            <a href="Servicio.html?id=${servicio.id_servicio}" class="card-servicio card-3d">
                <div class="card-icono card-icono-azul">
                    ${servicio.icono || "📌"}
                </div>

                <div class="card-body-custom">

                    <span class="etiqueta et-azul">
                        ${servicio.nombre_categoria || "Categoría no especificada"}
                    </span>

                    <p class="card-meta">
                        ${universidadTexto}
                    </p>

                    <h5>${servicio.titulo || "Sin título"}</h5>

                    <p class="texto-muted">
                        ${descripcion}
                    </p>

                    <div class="card-autor">
                        <div class="avatar avatar-azul">👤</div>
                        <span class="texto-muted">
                            ${servicio.proveedor || "Proveedor anónimo"}
                        </span>
                    </div>

                    <div class="texto-fecha">
                        ${servicio.fecha_publicacion || ""}
                    </div>

                    <div class="card-footer">
                        <div>
                            <hr class="card-divider">
                            <div class="estrellas">${estrellasTexto}</div>
                            <div class="texto-muted">${numReseñas} reseñas</div>
                        </div>

                        <div class="precio">
                            $${servicio.precio_hora || 0}
                        </div>
                    </div>

                </div>
            </a>
        `;

        contenedor.innerHTML += tarjeta;
    });
}

/* =========================
   FILTRO GLOBAL EN TIEMPO REAL
========================= */
function ejecutarFiltro() {
    const textoBusqueda = document
        .getElementById("input-busqueda-global")
        .value
        .toLowerCase()
        .trim();

    serviciosFiltrados = serviciosTotales.filter(servicio => {
        const titulo = (servicio.titulo || "").toLowerCase();
        const descripcion = (servicio.descripcion || "").toLowerCase();
        const categoria = (servicio.nombre_categoria || "").toLowerCase();
        const proveedor = (servicio.proveedor || "").toLowerCase();

        const coincideTexto =
            titulo.includes(textoBusqueda) ||
            descripcion.includes(textoBusqueda) ||
            categoria.includes(textoBusqueda) ||
            proveedor.includes(textoBusqueda);

        const coincideCategoria =
            categoriaActual === "todos" ||
            (servicio.nombre_categoria || "").toLowerCase().includes(categoriaActual);

        return coincideTexto && coincideCategoria;
    });

    renderizarServicios(serviciosFiltrados);
}

/* =========================
   FILTRO POR CATEGORÍA
========================= */
function filtrarPorCategoria(categoria, botonSeleccionado) {
    categoriaActual = categoria.toLowerCase();

    // quitar clase activo de todos los botones
    document.querySelectorAll("#filtros-categorias .chip").forEach(btn => {
        btn.classList.remove("activo");
    });

    // activar botón clickeado
    botonSeleccionado.classList.add("activo");

    ejecutarFiltro();
}

/* =========================
   OPCIONAL: función estrellas
   (por si no tienes calificacion.js)
========================= */
function calcularEstrellas(estrellas) {
    if (!Array.isArray(estrellas) || estrellas.length === 0) {
        return "☆☆☆☆☆";
    }

    const promedio =
        estrellas.reduce((acc, num) => acc + Number(num), 0) / estrellas.length;

    const completas = Math.round(promedio);
    return "★".repeat(completas) + "☆".repeat(5 - completas);
}