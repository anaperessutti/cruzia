import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getMetricasMes,
  getReporteComercio,
  mesISO,
  mesesRecientes,
  nombreMes,
  recalcularMetricas,
  type MetricaComercio,
} from "@/lib/admin-metrics";

export const Route = createFileRoute("/admin/panel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel de administración | Cruzia" },
      { name: "description", content: "Métricas por comercio y reportes en PDF de Cruzia." },
      { property: "og:title", content: "Panel de administración | Cruzia" },
      { property: "og:description", content: "Métricas por comercio y reportes en PDF de Cruzia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [mes, setMes] = useState(() => mesISO(new Date()));
  const [metricas, setMetricas] = useState<MetricaComercio[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [exportando, setExportando] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!activo) return;
      if (!data.user) {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      const { data: esAdmin } = await supabase.rpc("is_admin");
      if (!activo) return;
      if (!esAdmin) {
        setError("Tu cuenta no tiene permisos de administración.");
        setVerificando(false);
        return;
      }
      setVerificando(false);
    })();
    return () => {
      activo = false;
    };
  }, [navigate]);

  const cargar = useCallback(async (mesSel: string) => {
    setCargando(true);
    setError(null);
    try {
      setMetricas(await getMetricasMes(mesSel));
    } catch {
      setError("No pudimos cargar las métricas. Probá de nuevo en unos segundos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (verificando || error) return;
    void cargar(mes);
  }, [verificando, mes, cargar, error]);

  async function onRecalcular() {
    setAviso(null);
    setCargando(true);
    try {
      await recalcularMetricas(mes);
      await cargar(mes);
      setAviso(`Métricas de ${nombreMes(mes)} actualizadas.`);
    } catch {
      setError("No pudimos recalcular las métricas.");
    } finally {
      setCargando(false);
    }
  }

  async function onExportar(metrica: MetricaComercio) {
    setExportando(metrica.comercioId);
    setAviso(null);
    try {
      const reporte = await getReporteComercio(metrica);
      const { generarReportePdf, nombreArchivo } = await import("@/lib/reporte-pdf");
      const blob = await generarReportePdf(reporte);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo(reporte);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("No pudimos generar el PDF de ese comercio.");
    } finally {
      setExportando(null);
    }
  }

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando sesión…</p>
      </main>
    );
  }

  const totalMes = (metricas ?? []).reduce((acc, m) => acc + m.totalRedenciones, 0);
  const totalInteracciones = (metricas ?? []).reduce((acc, m) => acc + m.totalInteracciones, 0);

  return (
    <AdminShell titulo="Métricas">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Métricas por comercio</CardTitle>
            <CardDescription>
              Elegí el período. Cada comercio puede descargar su reporte en PDF con la marca de Cruzia,
              listo para reenviar por WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mesesRecientes().map((m) => (
                    <SelectItem key={m} value={m}>
                      {nombreMes(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full sm:w-auto" variant="outline" onClick={onRecalcular} disabled={cargando}>
                {cargando ? "Procesando…" : "Recalcular este mes"}
              </Button>
              <span className="text-sm text-muted-foreground">
                Total del período: <strong>{totalMes}</strong> activaciones ·{" "}
                <strong>{totalInteracciones}</strong> interacciones
              </span>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {aviso && <p className="text-sm text-muted-foreground">{aviso}</p>}

            {metricas && metricas.length === 0 && !cargando ? (
              <p className="text-sm text-muted-foreground">
                No hay métricas cargadas para {nombreMes(mes)}. Tocá “Recalcular este mes” para
                generarlas con las activaciones registradas.
              </p>
            ) : null}

            {metricas && metricas.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comercio</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Localidad</TableHead>
                      <TableHead className="text-right">Activaciones</TableHead>
                      <TableHead className="text-right">Interacciones</TableHead>
                      <TableHead>Promo más usada</TableHead>
                      <TableHead className="text-right">Reporte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metricas.map((m) => (
                      <TableRow key={m.comercioId}>
                        <TableCell className="sticky left-0 z-10 bg-card font-medium">{m.comercio}</TableCell>
                        <TableCell>
                          <Badge variant={m.prioridadPlan <= 2 ? "default" : "outline"}>{m.plan}</Badge>
                        </TableCell>
                        <TableCell>{m.localidad ?? "—"}</TableCell>
                        <TableCell className="text-right">{m.totalRedenciones}</TableCell>
                        <TableCell className="text-right">{m.totalInteracciones}</TableCell>
                        <TableCell>{m.cuponTop ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => onExportar(m)}
                            disabled={exportando === m.comercioId}
                          >
                            {exportando === m.comercioId ? "Generando…" : "Exportar a PDF"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
