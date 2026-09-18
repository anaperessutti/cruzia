import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { ReporteComercio } from "./admin-metrics";
import { nombreMes } from "./admin-metrics";

const MARCA = {
  azul: "#12355B",
  coral: "#F2545B",
  celeste: "#6EC5E9",
  fondo: "#FAFAF7",
  gris: "#6B7280",
  linea: "#E5E7EB",
};

type Variante = {
  header: string;
  acento: string;
  mostrarSello: boolean;
  etiqueta: string;
  franja: boolean;
};

/** El tratamiento visual se deriva de la prioridad del plan (tabla `planes`), no de nombres fijos. */
function varianteDePlan(prioridad: number, plan: string): Variante {
  if (prioridad <= 1) {
    return { header: MARCA.azul, acento: MARCA.coral, mostrarSello: true, etiqueta: plan, franja: true };
  }
  if (prioridad === 2) {
    return { header: MARCA.azul, acento: MARCA.celeste, mostrarSello: false, etiqueta: plan, franja: true };
  }
  return { header: MARCA.azul, acento: MARCA.gris, mostrarSello: false, etiqueta: plan, franja: false };
}

const s = StyleSheet.create({
  page: { backgroundColor: MARCA.fondo, paddingBottom: 56, fontSize: 11, color: MARCA.azul },
  header: { paddingHorizontal: 40, paddingTop: 34, paddingBottom: 26 },
  marca: { fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: 1 },
  marcaSub: { fontSize: 9, color: "#FFFFFF", opacity: 0.85, marginTop: 2 },
  franja: { height: 6, width: "100%" },
  selloFila: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sello: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    color: "#FFFFFF",
    fontSize: 9,
    letterSpacing: 1,
  },
  body: { paddingHorizontal: 40, paddingTop: 26 },
  comercio: { fontSize: 22, fontWeight: 700 },
  meta: { fontSize: 10, color: MARCA.gris, marginTop: 4 },
  periodo: { fontSize: 12, marginTop: 14, fontWeight: 700 },
  tarjetas: { flexDirection: "row", gap: 12, marginTop: 14 },
  tarjeta: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 14,
  },
  tarjetaNum: { fontSize: 24, fontWeight: 700 },
  tarjetaLabel: { fontSize: 9, color: MARCA.gris, marginTop: 4 },
  seccion: { fontSize: 13, fontWeight: 700, marginTop: 26, marginBottom: 8 },
  filaHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: MARCA.linea,
    paddingBottom: 6,
    fontSize: 9,
    color: MARCA.gris,
  },
  fila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: MARCA.linea,
    paddingVertical: 8,
    fontSize: 10,
  },
  colTitulo: { flex: 3 },
  colMod: { flex: 1.4 },
  colNum: { flex: 1, textAlign: "right" },
  destacado: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: MARCA.linea,
  },
  destacadoLabel: { fontSize: 9, color: MARCA.gris },
  destacadoValor: { fontSize: 14, fontWeight: 700, marginTop: 4 },
  vacio: { fontSize: 10, color: MARCA.gris, marginTop: 10 },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    fontSize: 8,
    color: MARCA.gris,
    borderTopWidth: 1,
    borderTopColor: MARCA.linea,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function ReporteDoc({ reporte }: { reporte: ReporteComercio }) {
  const { metrica, detalle, clicksWhatsapp, generadoEl } = reporte;
  const v = varianteDePlan(metrica.prioridadPlan, metrica.plan);
  const meta = [metrica.rubro, metrica.localidad].filter(Boolean).join(" · ");

  return (
    <Document
      title={`AUNA Reporte ${metrica.comercio} ${nombreMes(metrica.mes)}`}
      author="AUNA — Comunidad del Partido de la Costa"
    >
      <Page size="A4" style={s.page}>
        <View style={[s.header, { backgroundColor: v.header }]}>
          <View style={s.selloFila}>
            <View>
              <Text style={s.marca}>AUNA</Text>
              <Text style={s.marcaSub}>Cupones y beneficios del Partido de la Costa</Text>
            </View>
            <View>
              <Text style={s.sello}>{v.mostrarSello ? `★ ${v.etiqueta.toUpperCase()}` : v.etiqueta.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        {v.franja && <View style={[s.franja, { backgroundColor: v.acento }]} />}

        <View style={s.body}>
          <Text style={s.comercio}>{metrica.comercio}</Text>
          {meta ? <Text style={s.meta}>{meta}</Text> : null}
          <Text style={[s.periodo, { color: v.acento }]}>Reporte de {nombreMes(metrica.mes)}</Text>

          <View style={s.tarjetas}>
            <View style={[s.tarjeta, { borderLeftColor: v.acento }]}>
              <Text style={s.tarjetaNum}>{metrica.totalRedenciones}</Text>
              <Text style={s.tarjetaLabel}>Cupones activados</Text>
            </View>
            <View style={[s.tarjeta, { borderLeftColor: MARCA.celeste }]}>
              <Text style={s.tarjetaNum}>{clicksWhatsapp}</Text>
              <Text style={s.tarjetaLabel}>Consultas por WhatsApp</Text>
            </View>
            <View style={[s.tarjeta, { borderLeftColor: MARCA.azul }]}>
              <Text style={s.tarjetaNum}>{detalle.filter((d) => d.redenciones > 0).length}</Text>
              <Text style={s.tarjetaLabel}>Promos con movimiento</Text>
            </View>
          </View>

          <Text style={s.seccion}>Detalle por promoción</Text>
          {detalle.length === 0 ? (
            <Text style={s.vacio}>El comercio todavía no tiene promociones cargadas.</Text>
          ) : (
            <View>
              <View style={s.filaHead}>
                <Text style={s.colTitulo}>Promoción</Text>
                <Text style={s.colMod}>Modalidad</Text>
                <Text style={s.colNum}>Activaciones</Text>
              </View>
              {detalle.map((d) => (
                <View style={s.fila} key={d.cuponId}>
                  <Text style={s.colTitulo}>{d.titulo}</Text>
                  <Text style={s.colMod}>{d.modalidad === "whatsapp" ? "WhatsApp" : "Presencial"}</Text>
                  <Text style={s.colNum}>{d.redenciones}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={[s.destacado, v.mostrarSello ? { borderColor: v.acento, borderWidth: 2 } : {}]}>
            <Text style={s.destacadoLabel}>Promoción más usada del mes</Text>
            <Text style={s.destacadoValor}>{metrica.cuponTop ?? "Sin activaciones en el período"}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text>AUNA · Generado el {generadoEl}</Text>
          <Text>auna.comunidad@gmail.com · @somos_auna</Text>
        </View>
      </Page>
    </Document>
  );
}

export function nombreArchivo(reporte: ReporteComercio): string {
  const slug = reporte.metrica.comercio
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `AUNA-reporte-${slug}-${reporte.metrica.mes.slice(0, 7)}.pdf`;
}

export async function generarReportePdf(reporte: ReporteComercio): Promise<Blob> {
  return pdf(<ReporteDoc reporte={reporte} />).toBlob();
}
