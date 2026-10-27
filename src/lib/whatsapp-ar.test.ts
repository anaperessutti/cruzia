import { describe, expect, it } from "vitest";
import { armarMensaje, normalizarWhatsappAR, NOTA_FISICO } from "./whatsapp-ar";

describe("normalizarWhatsappAR", () => {
  it("número local con área", () => expect(normalizarWhatsappAR("2257 400000")).toBe("5492257400000"));
  it("con 0 y 15", () => expect(normalizarWhatsappAR("02257 15 400000")).toBe("5492257400000"));
  it("internacional con 9", () => expect(normalizarWhatsappAR("+54 9 2257 400000")).toBe("5492257400000"));
  it("CABA con 15", () => expect(normalizarWhatsappAR("011 15-1234-5678")).toBe("5491112345678"));
  it("vacío", () => expect(normalizarWhatsappAR("")).toBe(""));
});

describe("armarMensaje", () => {
  it("reemplaza variables y nota física", () => {
    expect(armarMensaje("Pagá {link_pago}\n\n{nota_fisico}", { link_pago: "x", nota_fisico: NOTA_FISICO })).toBe(
      `Pagá x\n\n${NOTA_FISICO}`,
    );
  });
  it("digital deja la nota vacía", () => {
    expect(armarMensaje("Pagá {link_pago}\n\n{nota_fisico}", { link_pago: "x", nota_fisico: "" })).toBe("Pagá x");
  });
});
