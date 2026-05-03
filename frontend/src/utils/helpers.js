export function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  return new Date(fechaISO).toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric"
  });
}

export function calcularEstrellas(resenas) {
  if (!Array.isArray(resenas) || resenas.length === 0)
    return { texto: "☆☆☆☆☆", prom: "0.0", num: 0 };

  const valores = resenas.map(r => typeof r === "object" ? Number(r.estrellas) : Number(r));
  const prom = valores.reduce((a, b) => a + b, 0) / valores.length;
  const llenas = Math.round(prom);

  return {
    texto: "★".repeat(llenas) + "☆".repeat(5 - llenas),
    prom:  prom.toFixed(1),
    num:   valores.length,
  };
}

export function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}