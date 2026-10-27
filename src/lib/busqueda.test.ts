import { describe, test } from "node:test";
import { strictEqual } from "node:assert";
import { coincide, normalizar, raiz } from "./busqueda";

describe("búsqueda flexible", () => {
  test("normaliza mayúsculas, tildes, signos y espacios", () => {
    strictEqual(normalizar("  CAFÉ,   Mar de Ajó! "), "cafe mar de ajo");
  });
  test("quita terminaciones y descarta raíces demasiado cortas", () => {
    for (const palabra of [
      "churrería",
      "churrero",
      "churrera",
      "churres",
      "churrs",
      "churrito",
      "churrita",
    ]) {
      strictEqual(raiz(palabra), "churr");
    }
    strictEqual(raiz("casas"), "casa");
    strictEqual(raiz("gatos"), "gatos");
    strictEqual(coincide("pan", "pantalla"), false);
  });
  test("churro encuentra churrería en ambos sentidos", () => {
    strictEqual(coincide("churro", "Churrería de la Costa"), true);
    strictEqual(coincide("churrería", "Churros de la Costa"), true);
  });
  test("heladria encuentra heladería con una letra omitida", () => {
    strictEqual(coincide("heladria", "Heladería"), true);
    strictEqual(coincide("helaxria", "Heladería"), false);
  });
  test("tolera sustitución o inserción solo en palabras largas", () => {
    strictEqual(coincide("merinda", "merienda"), true);
    strictEqual(coincide("merianda", "merienda"), true);
    strictEqual(coincide("mar", "bar"), false);
  });
  test("exige todas las palabras de la consulta", () => {
    strictEqual(coincide("churro costa", "Churrería de la Costa"), true);
    strictEqual(coincide("churro playa", "Churrería de la Costa"), false);
  });
  test("expande sinónimos incluyendo frases completas", () => {
    strictEqual(coincide("birra", "Cervecería artesanal"), true);
    strictEqual(coincide("churro", "Dulce de leche"), true);
    strictEqual(coincide("churro", "Dulce de membrillo"), false);
    strictEqual(coincide("café", "Cafetería"), true);
    strictEqual(coincide("pizza", "Pizzería"), true);
    strictEqual(coincide("helado", "Heladería"), true);
  });
  test("consultas vacías no devuelven coincidencias", () => {
    strictEqual(coincide("!!", "Churrería"), false);
  });
});
