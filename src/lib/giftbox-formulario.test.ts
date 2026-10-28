import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import { guardarFormulario } from "./giftbox-formulario";

describe("guardado del formulario compartido", () => {
  it("no envía datos en vista previa", async () => {
    let llamadas = 0;
    const resultado = await guardarFormulario(true, async () => {
      llamadas++;
      return { error: null };
    });
    strictEqual(llamadas, 0);
    strictEqual(resultado, null);
  });

  it("conserva el guardado y su resultado en el formulario real", async () => {
    let llamadas = 0;
    const respuesta = { error: null };
    const resultado = await guardarFormulario(false, async () => {
      llamadas++;
      return respuesta;
    });
    strictEqual(llamadas, 1);
    strictEqual(resultado, respuesta);
  });
});
