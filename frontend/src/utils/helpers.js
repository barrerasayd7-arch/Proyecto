export function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  return new Date(fechaISO).toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric"
  });
}

// Aprovecha y exporta los otros helpers que también usas en varios lados
export function calcularEstrellas(estrellas) {
  if (!Array.isArray(estrellas) || estrellas.length === 0)
    return { texto: "☆☆☆☆☆", prom: 0, num: 0 };
  const prom = estrellas.reduce((a, b) => a + Number(b), 0) / estrellas.length;
  const llenas = Math.round(prom);
  return {
    texto: "★".repeat(llenas) + "☆".repeat(5 - llenas),
    prom:  prom.toFixed(1),
    num:   estrellas.length,
  };
}

export function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}