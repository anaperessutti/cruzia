# Nota para los formularios públicos (Gift Box, Huella Solidaria, Subite a la Ola)

Las tablas `giftbox_pedidos`, `postulaciones_solidarias` y `leads_comercios` permiten
**solo INSERT anónimo, nunca SELECT**. Es intencional, por seguridad.

Al construir esos formularios:

- NO encadenar `.select()` después del `.insert()` en esas tres tablas.
  Ejemplo incorrecto: `supabase.from("leads_comercios").insert(payload).select().single()`
  Ejemplo correcto:   `supabase.from("leads_comercios").insert(payload)`
- La pantalla de confirmación de éxito se arma con los datos que ya tiene el
  formulario en el frontend (nombre, items elegidos, total calculado, etc.),
  nunca releyendo la fila insertada desde la base.
- Si se necesita un identificador visible para la usuaria, generarlo en el cliente
  o devolverlo desde una función server-side con permisos elevados, no leyendo la tabla.

Incumplir esto produce un error de permisos (RLS) justo después de un insert exitoso,
y la usuaria ve un fallo aunque sus datos se hayan guardado bien.
