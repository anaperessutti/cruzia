

## ClimaOrden automático de las filas temáticas del Inicio

Las 12 filas de categorías del Inicio se reordenan solas según el clima del momento y la hora local. El banner de arriba y "Favoritos de la Costa" no se tocan: siguen siempre fijos en las dos primeras posiciones.

## Ubicación usada para el clima

Una sola lectura para toda la app, tomada en **Santa Teresita: -36.5416, -56.6906**.

Es la referencia que pediste y funciona bien como punto medio de la franja costera. Si preferís algo todavía más central entre San Clemente y Punta Médanos, la alternativa sería -36.64 / -56.67 (mar abierto frente a Aguas Verdes). Decime si querés esa en su lugar.

- La consulta a OpenWeatherMap se hace desde el servidor, con la clave guardada como secreto. Nunca viaja al navegador ni queda en el código.
- El resultado se guarda en caché **20 minutos**: la primera visita después de ese lapso refresca la lectura y el resto de las visitas la reutilizan.
- Si la consulta falla o no hay clave cargada, se asume "buen clima" y manda la regla horaria. El Inicio nunca se rompe por el clima.

## Regla de mal clima (tiene prioridad)

Se considera mal clima si llueve (Rain/Drizzle/Thunderstorm), está muy nublado (cobertura alta) o hace frío (menos de 14 °C).

En ese caso las primeras filas quedan así: Delivery y take away · Juegos y Entretenimiento · Tardes y antojos · Ropa y accesorios · Relax y Belleza. Dentro de "Juegos y Entretenimiento" se muestran primero los lugares marcados como bajo techo. "Playa y Aire Libre" se manda al final de todas las filas.

## Rotación por horario (solo con buen clima)

Según la hora de Argentina:

- 06:00–11:29 — Tardes y antojos · Playa y Aire Libre · Almuerzos y tapeos · Mercados y kioscos
- 11:30–14:59 — Almuerzos y tapeos · Playa y Aire Libre · Delivery y take away · Mercados y kioscos
- 15:00–19:29 — Tardes y antojos · Playa y Aire Libre · Relax y Belleza
- 19:30–05:59 — Cenas y tragos · Eventos · Delivery y take away · Juegos y Entretenimiento

Las categorías que no figuran en la lista del momento van después, en el orden original de las 12. Las filas vacías se siguen ocultando como hoy.

## Cuándo cambia

El orden se calcula al cargar o refrescar el Inicio. Mientras la persona navega sin recargar, el orden no se mueve.

## Prueba antes de dejarlo activo

Voy a mostrarte el orden resultante en dos escenarios simulados: un día de lluvia y un mediodía soleado, para que confirmes que prioriza bien.

## Detalles técnicos

- `src/lib/clima.functions.ts`: server function `getClimaCosta` que llama a `api.openweathermap.org/data/2.5/weather` con `OPENWEATHER_API_KEY` leída dentro del handler; devuelve `{ condicion, nubosidad, tempC, malClima }`. Caché en memoria del worker con TTL de 20 min.
- `src/lib/orden-colecciones.ts`: función pura `ordenarColecciones(colecciones, { malClima, horaLocal })` que devuelve los IDs ordenados; matchea por nombre de colección. Testeable sin red.
- `src/components/public/home-carousels.tsx`: consulta el clima con `useQuery` (`staleTime` alto) y aplica el orden a las filas ya construidas; además, dentro de "Juegos y Entretenimiento" con mal clima ordena primero `comercios.es_indoor`.
- La hora se obtiene con `Intl.DateTimeFormat` en zona `America/Argentina/Buenos_Aires`, así no depende del reloj del visitante.

## Lo que necesito de vos

La clave de OpenWeatherMap, para guardarla como secreto. Te la pido con el formulario seguro cuando aprobemos el plan.