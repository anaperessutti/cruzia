import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getCatalogos,
  getComerciosAdmin,
  type CatalogosCms,
  type Comercio,
} from "@/lib/admin-cms";

export const Route = createFileRoute("/admin/comercios/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Comercios | Panel OLA!" },
      { name: "description", content: "Alta y edición de comercios de OLA!." },
      { property: "og:title", content: "Comercios | Panel OLA!" },
      { property: "og:description", content: "Alta y edición de comercios de OLA!." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComerciosAdmin,
});

function ComerciosAdmin() {
  const [comercios, setComercios] = useState<Comercio[] | null>(null);
  const [catalogos, setCatalogos] = useState<CatalogosCms | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [lista, cat] = await Promise.all([getComerciosAdmin(), getCatalogos()]);
        if (!activo) return;
        setComercios(lista);
        setCatalogos(cat);
      } catch {
        if (activo) setError("No pudimos cargar los comercios.");
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const nombre = (id: string | null, lista: { id: string; nombre: string }[] | undefined) =>
    lista?.find((x) => x.id === id)?.nombre ?? "—";

  const filtrados = (comercios ?? []).filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  return (
    <AdminShell titulo="Comercios">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Comercios</CardTitle>
            <CardDescription>
              Cargá y editá las fichas completas. Las promociones se editan aparte, desde
              “Promociones”.
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/admin/comercios/$comercioId" params={{ comercioId: "nuevo" }}>
              Nuevo comercio
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Buscar por nombre…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-xs"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!comercios && !error && <p className="text-sm text-muted-foreground">Cargando…</p>}
          {comercios && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Rubro</TableHead>
                    <TableHead>Localidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell>{nombre(c.plan_id, catalogos?.planes)}</TableCell>
                      <TableCell>{nombre(c.rubro_id, catalogos?.rubros)}</TableCell>
                      <TableCell>{nombre(c.localidad_id, catalogos?.localidades)}</TableCell>
                      <TableCell>
                        <Badge variant={c.activo ? "default" : "outline"}>
                          {c.activo ? "Publicado" : "Oculto"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/admin/comercios/$comercioId" params={{ comercioId: c.id }}>
                            Editar ficha
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/admin/cupones" search={{ comercio: c.id }}>
                            Promociones
                          </Link>
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
    </AdminShell>
  );
}
