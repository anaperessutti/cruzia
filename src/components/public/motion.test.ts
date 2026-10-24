import { describe, test } from "node:test";
import { strictEqual, deepStrictEqual } from "node:assert";
import { suavizarVelocidad, sigueRapido, UMBRAL_SCROLL_RAPIDO, REPOSO_SCROLL_RAPIDO } from "./motion";
import { seleccionarTarjetasCarrusel } from "./carrusel-seccion";

describe("adaptive scroll rules", () => {
  test("uses a strict 1.1 px/ms threshold", () => {
    strictEqual(UMBRAL_SCROLL_RAPIDO, 1.1);
    strictEqual(sigueRapido(1.1, 1000, 0), false);
    strictEqual(sigueRapido(1.11, 1000, 0), true);
  });
  test("resets after 150ms without exceeding the threshold", () => {
    strictEqual(REPOSO_SCROLL_RAPIDO, 150);
    strictEqual(sigueRapido(0.1, 1149, 1000), true);
    strictEqual(sigueRapido(0.1, 1150, 1000), false);
  });
  test("smooths vertical speed equally in both directions", () => {
    strictEqual(suavizarVelocidad(0, 64, 16), 1.4);
    strictEqual(suavizarVelocidad(0, -64, 16), 1.4);
  });
  test("keeps exactly the first six real cards", () => {
    deepStrictEqual(seleccionarTarjetasCarrusel([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), [1, 2, 3, 4, 5, 6]);
  });
});