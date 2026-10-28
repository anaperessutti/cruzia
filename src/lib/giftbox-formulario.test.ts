import { describe, expect, it } from "vitest";
import { guardarFormulario } from "./giftbox-formulario";

describe("guardado del formulario compartido", () => {
  it("no envía datos en vista previa", async () => {
    let llamadas = 0;
    const resultado = await guardarFormulario(true, async () => {
      llamadas++;
      return { error: null };
    });
    expect(llamadas).toBe(0);
    expect(resultado).toBeNull();
  });

  it("conserva el guardado y su resultado en el formulario real", async () => {
    let llamadas = 0;
    const respuesta = { error: null };
    const resultado = await guardarFormulario(false, async () => {
      llamadas++;
      return respuesta;
    });
    expect(llamadas).toBe(1);
    expect(resultado).toBe(respuesta);
  });
});
