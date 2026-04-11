/* ===== FUNCIONES ===== */

// setError marca un campo de formulario como inválido y muestra el mensaje de error asociado.
function setError(input, message) {
  input.classList.add("error");
  input.classList.remove("success");
  const span = input.nextElementSibling || input.closest(".campo").querySelector(".error-msg");
  if (span) span.textContent = message;
}

// setSuccess marca un campo de formulario como válido y borra cualquier mensaje de error.
function setSuccess(input) {
  input.classList.remove("error");
  input.classList.add("success");
  const span = input.nextElementSibling || input.closest(".campo").querySelector(".error-msg");
  if (span) span.textContent = "";
}

/* ===== ELEMENTOS ===== */

// Referencias a los inputs del formulario de login y registro.
const telefono    = document.getElementById("l-telefono");
const pass        = document.getElementById("l-pass");
const nombre      = document.getElementById("r-nombre");
const telefonoReg = document.getElementById("r-telefono");
const passReg     = document.getElementById("r-pass");
const passReg2    = document.getElementById("r-pass2");
const terminos    = document.getElementById("terminos");

/* ===== VALIDACIÓN EN TIEMPO REAL - LOGIN ===== */

// Validación de teléfono en el login: solo números y exactamente 10 dígitos.
telefono.addEventListener("input", () => {
  const value = telefono.value.replace(/\D/g, "");
  telefono.value = value;
  value.length !== 10 ? setError(telefono, "Debe tener 10 dígitos") : setSuccess(telefono);
});

// Validación de contraseña en el login: mínimo 8 caracteres.
pass.addEventListener("input", () => {
  pass.value.length < 8 ? setError(pass, "Mínimo 8 caracteres") : setSuccess(pass);
});

/* ===== VALIDACIÓN EN TIEMPO REAL - REGISTRO ===== */

// Validación del nombre en el registro: entre 3 y 50 caracteres.
nombre.addEventListener("input", () => {
  const len = nombre.value.trim().length;
  if (len < 3) setError(nombre, "Mínimo 3 caracteres");
  else if (len > 50) setError(nombre, "Nombre muy largo");
  else setSuccess(nombre);
});

// Validación de teléfono en el registro: solo números y exactamente 10 dígitos.
telefonoReg.addEventListener("input", () => {
  const value = telefonoReg.value.replace(/\D/g, "");
  telefonoReg.value = value;
  value.length !== 10 ? setError(telefonoReg, "Debe tener 10 dígitos") : setSuccess(telefonoReg);
});

// Validación de contraseña principal en el registro y comprobación de coincidencia con la segunda contraseña.
passReg.addEventListener("input", () => {
  if (passReg.value.length < 8) {
    setError(passReg, "Mínimo 8 caracteres");
  } else {
    setSuccess(passReg);
    if (passReg2.value.length > 0) {
      passReg.value !== passReg2.value
        ? setError(passReg2, "Las contraseñas no coinciden")
        : setSuccess(passReg2);
    }
  }
});

// Validación de confirmación de contraseña en el registro.
passReg2.addEventListener("input", () => {
  if (passReg2.value.length < 8) setError(passReg2, "Mínimo 8 caracteres");
  else if (passReg.value !== passReg2.value) setError(passReg2, "Las contraseñas no coinciden");
  else setSuccess(passReg2);
});

/* ===== LOGIN ===== */

// Envío de login: validación local, petición al servidor y guardado en localStorage.
document.querySelector("#panel-login .btn-principal").addEventListener("click", function(e) {
  e.preventDefault();

  let valid = true;
  if (telefono.value.length !== 10) { setError(telefono, "Número inválido"); valid = false; }
  if (pass.value.length < 8)        { setError(pass, "Contraseña muy corta"); valid = false; }
  if (!valid) return;

  fetch(`http://localhost/api/crud/usuario_crud.php?telefono=${telefono.value}&password=${pass.value}`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      // Si el servidor responde ok, guardamos los datos del usuario en localStorage.
      localStorage.setItem("logueado", "true");
      localStorage.setItem("usuarioId", data.id);
      localStorage.setItem("usuario", data.nombre);
      localStorage.setItem("usuarioTelefono", data.telefono);

      // Marcar al usuario como activo en la base de datos.
      fetch("http://localhost/api/crud/usuario_crud.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: data.id, estado: 1 })
      }).finally(() => {
        alert("✅ Bienvenido " + data.nombre + " ✅");
        window.location.href = "HomePrincipal.html";
      });

    } else {
      alert("❌ Teléfono o contraseña incorrectos ❌");
    }
  })
  .catch(() => alert("❌ Error de conexión con el servidor"));
});

// Botón de invitado: limpia el estado de login y redirige al usuario invitado.
const botonInvitado = document.getElementById("btn-invitado");
if (botonInvitado) {
  botonInvitado.addEventListener("click", () => {
    localStorage.removeItem("logueado");
    localStorage.removeItem("usuario");
    localStorage.removeItem("usuarioTelefono");
    window.location.href = "HomeGuest.html";
  });
}

/* ===== REGISTRO ===== */

// Envío de registro: validación de campos, petición POST y respuesta del servidor.
document.querySelector("#panel-registro .btn-principal").addEventListener("click", function(e) {
  e.preventDefault();

  let valid = true;
  if (telefonoReg.value.length !== 10) { setError(telefonoReg, "Número inválido"); valid = false; }
  if (passReg.value.length < 8)        { setError(passReg, "Contraseña muy corta"); valid = false; }
  if (passReg2.value.length < 8 || passReg.value !== passReg2.value) { setError(passReg2, "Contraseñas no coinciden"); valid = false; }
  if (nombre.value.trim().length < 3)   { setError(nombre, "Nombre muy corto"); valid = false; }
  if (!terminos.checked) { alert("❌ Debes aceptar los Términos y Condiciones"); valid = false; }

  if (!valid) return;

  const nuevoUsuario = {
    telefono: telefonoReg.value,
    password: passReg.value,
    nombre:   nombre.value.trim()
  };

  fetch("http://localhost/api/crud/usuario_crud.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoUsuario)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("❌ " + data.error);
    } else {
      alert("✅ Cuenta creada exitosamente, " + nuevoUsuario.nombre + " ✅\n\nAhora inicia sesión.");
      nombre.value = ""; telefonoReg.value = ""; passReg.value = ""; passReg2.value = "";
      terminos.checked = false;
      [nombre, telefonoReg, passReg, passReg2].forEach(i => i.classList.remove("error", "success"));
      document.getElementById("r-login").click();
    }
  })
  .catch(() => alert("❌ Error de conexión con el servidor"));
});

/* ===== EFECTO DINÁMICO DE FONDO EN SCROLL ===== */

// Ajusta el estilo visual del fondo dinámico mientras el usuario hace scroll.
document.addEventListener('DOMContentLoaded', function() {
  const dynamicBg = document.querySelector('.dynamic-bg');
  if (dynamicBg) {
    window.addEventListener('scroll', function() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      dynamicBg.style.opacity   = Math.max(0.3, 1 - scrollProgress * 0.5);
      dynamicBg.style.transform = `scale(${1 + scrollProgress * 0.1})`;
      dynamicBg.style.filter    = `blur(${scrollProgress * 10}px)`;
    });
  }
});