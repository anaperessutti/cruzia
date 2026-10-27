/** Vocabulario ampliable sin cambiar el buscador ni consultar servicios. */
export const SINONIMOS: Record<string, string[]> = {
  churro: ["churrería", "dulce de leche", "merienda"],
  birra: ["cervecería", "cerveza"],
  pizza: ["pizzería"],
  helado: ["heladería"],
  café: ["cafetería"],
};

export function normalizar(texto: string): string {
  return texto
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function raiz(palabra: string): string {
  const normal = normalizar(palabra);
  const candidata = normal.replace(/(?:eria|ero|era|ito|ita|es|s)$/u, "");
  // No usar raíces cortas: conservamos la palabra para la coincidencia exacta.
  return candidata.length >= 4 ? candidata : normal;
}

function unaLetra(a: string, b: string): boolean {
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let errores = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++errores > 1) return false;
    if (a.length <= b.length) j++;
    if (a.length >= b.length) i++;
  }
  return errores + (a.length - i) + (b.length - j) <= 1;
}

function palabrasCoinciden(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = raiz(a);
  const rb = raiz(b);
  return (
    (Math.min(ra.length, rb.length) >= 4 && (ra.startsWith(rb) || rb.startsWith(ra))) ||
    unaLetra(a, b) ||
    unaLetra(ra, rb)
  );
}

export function coincide(consulta: string, texto: string): boolean {
  const palabras = normalizar(consulta).split(" ").filter(Boolean);
  const destino = normalizar(texto).split(" ").filter(Boolean);
  if (!palabras.length || !destino.length) return false;
  return palabras.every((palabra) => {
    if (destino.some((otra) => palabrasCoinciden(palabra, otra))) return true;
    return Object.entries(SINONIMOS).some(([clave, sinonimos]) =>
      palabrasCoinciden(palabra, normalizar(clave)) && sinonimos.some((sinonimo) =>
        normalizar(sinonimo).split(" ").every((parte) =>
          destino.some((otra) => palabrasCoinciden(parte, otra)),
        ),
      ),
    );
  });
}