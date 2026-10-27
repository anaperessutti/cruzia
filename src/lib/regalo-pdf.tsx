import { Document, Image, Link, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";

import {
  linkMaps,
  OCASION,
  textoCanjeada,
  textoVigencia,
  tituloBienvenida,
  type Presentacion,
  type RegaloOk,
} from "./regalo";

/** Colores del tema Gift Box (src/styles.css, .theme-gift). */
const C = { fondo: "#2f3334", tarjeta: "#3a3e41", texto: "#FFFFFF", suave: "#C9CBCD", linea: "#5a5e62", acento: "#F2DCC0" };

const s = StyleSheet.create({
  page: { backgroundColor: C.fondo, color: C.texto, fontSize: 10.5, paddingBottom: 48 },
  fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.18, objectFit: "cover" },
  portada: { width: "100%", height: 230, objectFit: "cover" },
  cuerpo: { paddingHorizontal: 40, paddingTop: 24 },
  logo: { height: 26, objectFit: "contain", alignSelf: "flex-start", marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: 700, lineHeight: 1.2 },
  firma: { fontSize: 13, color: C.suave, marginTop: 8 },
  ocasion: { fontSize: 10, color: C.suave, marginTop: 2 },
  dedicatoria: { marginTop: 14, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: C.acento, fontStyle: "italic", lineHeight: 1.5, fontSize: 11.5 },
  card: { backgroundColor: C.tarjeta, borderRadius: 14, padding: 16, marginTop: 14 },
  h2: { fontSize: 15, fontWeight: 700 },
  sobre: { fontSize: 8.5, letterSpacing: 1.5, color: C.acento, marginBottom: 6 },
  linea: { color: C.suave, marginTop: 3, lineHeight: 1.4 },
  parrafo: { marginTop: 8, lineHeight: 1.5 },
  sub: { fontSize: 10, fontWeight: 700, marginTop: 10 },
  link: { color: C.acento, marginTop: 6, textDecoration: "none" },
  canje: { color: C.acento, fontSize: 9, marginTop: 4 },
  codigoCard: { backgroundColor: C.tarjeta, borderRadius: 14, padding: 18, marginTop: 14, alignItems: "center" },
  codigo: { fontSize: 22, letterSpacing: 4, fontWeight: 700, marginTop: 4 },
  qr: { width: 120, height: 120, marginTop: 10 },
  pie: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 8, color: C.suave, textAlign: "center" },
});

async function aPng(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  try {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await img.decode();
    const max = 1600;
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

type Imagenes = { portada: string | null; logo: string | null; fondo: string | null; qr: string };

function RegaloDoc({ info, p, img }: { info: RegaloOk; p: Presentacion | null; img: Imagenes }) {
  const ocasion = info.ocasion ? OCASION[info.ocasion] ?? info.ocasion : "";
  return (
    <Document title="Tu Gift Box de Cruzia" author="Cruzia">
      <Page size="A4" style={s.page}>
        {img.fondo && <Image src={img.fondo} style={s.fondo} fixed />}
        {img.portada && <Image src={img.portada} style={s.portada} />}
        <View style={s.cuerpo}>
          {img.logo && <Image src={img.logo} style={s.logo} />}
          <Text style={s.titulo}>{tituloBienvenida(p?.titulo_bienvenida, info.agasajado)}</Text>
          {info.completado ? (
            <>
              {info.firma ? <Text style={s.firma}>De parte de {info.firma}</Text> : null}
              {ocasion ? <Text style={s.ocasion}>{ocasion}</Text> : null}
              {info.dedicatoria ? <Text style={s.dedicatoria}>{info.dedicatoria}</Text> : null}
            </>
          ) : (
            <Text style={s.firma}>Estamos terminando de preparar los detalles de este regalo.</Text>
          )}

          {info.experiencias.map((e) => {
            const maps = linkMaps(e);
            const vig = textoVigencia(e);
            return (
              <View key={e.id} style={s.card} wrap={false}>
                <Text style={s.h2}>{e.titulo}</Text>
                {e.canjeada_at ? <Text style={s.canje}>✓ {textoCanjeada(e.canjeada_at)}</Text> : null}
                {e.lugar ? <Text style={s.linea}>{e.lugar}</Text> : null}
                {e.direccion ? <Text style={s.linea}>Dirección: {e.direccion}</Text> : null}
                {e.horarios ? <Text style={s.linea}>Horarios: {e.horarios}</Text> : null}
                {vig ? <Text style={s.linea}>Vigencia: {vig}</Text> : null}
                {e.descripcion ? <Text style={s.parrafo}>{e.descripcion}</Text> : null}
                {maps ? <Link src={maps} style={s.link}>Ver en Google Maps</Link> : null}
                {e.como_canjear ? (<><Text style={s.sub}>Cómo canjear</Text><Text style={s.linea}>{e.como_canjear}</Text></>) : null}
                {e.condiciones ? (<><Text style={s.sub}>Condiciones</Text><Text style={s.linea}>{e.condiciones}</Text></>) : null}
              </View>
            );
          })}

          <View style={s.codigoCard} wrap={false}>
            <Text style={s.sobre}>TU CÓDIGO DE CANJE</Text>
            <Text style={s.codigo}>{info.codigo}</Text>
            <Image src={img.qr} style={s.qr} />
          </View>

          {[
            ["CÓMO CANJEAR", p?.texto_como_canjear],
            ["CONDICIONES GENERALES", p?.condiciones_generales],
            ["¿NECESITÁS AYUDA?", p?.contacto_soporte],
          ]
            .filter(([, t]) => t)
            .map(([t, v]) => (
              <View key={t} style={s.card} wrap={false}>
                <Text style={s.sobre}>{t}</Text>
                <Text style={{ lineHeight: 1.5, color: C.suave }}>{v}</Text>
              </View>
            ))}
        </View>
        <Text style={s.pie} fixed>Cruzia · Gift Box · cruzia.ar</Text>
      </Page>
    </Document>
  );
}

export async function generarRegaloPdf(info: RegaloOk, p: Presentacion | null): Promise<Blob> {
  const QR = await import("qrcode");
  const [portada, logo, fondo, qr] = await Promise.all([
    aPng(p?.imagen_portada),
    aPng(p?.logo),
    aPng(p?.imagen_fondo),
    QR.toDataURL(info.codigo, { margin: 1, width: 360 }),
  ]);
  return pdf(<RegaloDoc info={info} p={p} img={{ portada, logo, fondo, qr }} />).toBlob();
}

export function nombrePdfRegalo(info: RegaloOk) {
  return `Cruzia-gift-box-${info.codigo}.pdf`;
}
