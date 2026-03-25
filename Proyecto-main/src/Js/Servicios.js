const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const Universidad = document.getElementById("universidad");
const presencial = document.getElementById("presencial");
const virtual = document.getElementById("virtual");
const mixta = document.getElementById("mixta");
const semana = document.getElementById("semana");
const finDeSemana = document.getElementById("finesemana");
const siempre = document.getElementById("siempre");

// El número del usuario logueado:
const publicador = localStorage.getItem('usuarioTelefono') || localStorage.getItem('usuario') || 'Desconocido';

// Si no hay servicios aún, precargar ejemplos del usuario 7778889944
if (!localStorage.getItem('logstore_servicios')) {
  const serviciosIniciales = [
    {
      id: Date.now(),
      titulo: 'Tutoría de Álgebra Lineal',
      descripcion: 'Clases online o presencial de álgebra y matrices.',
      categoria: 'tutorias',
      precio: '30000',
      universidad: 'Universidad Nacional',
      contacto: '7778889944',
      modalidad: { presencial: true, virtual: true, mixta: false },
      disponibilidad: 'Entre semana',
      publicador: '7778889944',
      fechaPublicacion: new Date().toLocaleString()
    },
    {
      id: Date.now() + 1,
      titulo: 'Revisión de ensayo en normas APA',
      descripcion: 'Corrección y estructura de ensayos universitarios.',
      categoria: 'ensayos',
      precio: '25000',
      universidad: 'Universidad Javeriana',
      contacto: '7778889944',
      modalidad: { presencial: false, virtual: true, mixta: false },
      disponibilidad: 'Siempre disponible',
      publicador: '7778889944',
      fechaPublicacion: new Date().toLocaleString()
    }
  ];
  localStorage.setItem('logstore_servicios', JSON.stringify(serviciosIniciales));
}

const formPublicar = document.getElementById('form-publicar-servicio') || document.querySelector('#publicar')?.closest('form');

if (!formPublicar) {
  console.error('No se encontró el formulario de publicar servicio.');
} else {
  formPublicar.addEventListener('submit', function(e) {
    e.preventDefault();

    const nuevoServicio = {
      id: Date.now(),
      titulo: titulo.value.trim(),
      descripcion: descripcion.value.trim(),
      categoria: categoria.value,
      precio: precio.value,
      universidad: Universidad.value.trim(),
      contacto: localStorage.getItem('usuarioTelefono') || localStorage.getItem('usuario') || 'Sin contacto',
      modalidad: {
        presencial: presencial.checked,
        virtual: virtual.checked,
        mixta: mixta.checked
      },
      disponibilidad: document.querySelector('input[name="disponibilidad"]:checked')?.value || 'No especificado',
      publicador: publicador,
      fechaPublicacion: new Date().toLocaleString()
    };

    let serviciosGuardados = JSON.parse(localStorage.getItem('logstore_servicios')) || [];
    serviciosGuardados.push(nuevoServicio);
    localStorage.setItem('logstore_servicios', JSON.stringify(serviciosGuardados));

    console.log('Servicio guardado:', nuevoServicio);
    alert('¡Servicio publicado con éxito!');

    formPublicar.reset();
  });
}

window.verServicios = function() {
  const serviciosGuardados = JSON.parse(localStorage.getItem('logstore_servicios')) || [];
  console.clear();
  console.log('🛠️ SERVICIOS PUBLICADOS:');
  console.table(serviciosGuardados);
  console.log('Total de servicios: ' + serviciosGuardados.length);
  return serviciosGuardados;
};
