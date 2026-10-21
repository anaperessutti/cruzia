# Roadmap

- [x] Ajustar escalonado horizontal, entrada de la primera colección desde el final real del hero y cobertura continua del fondo móvil; verificado en Chromium/WebKit a 390px (844/932px de alto), escritorio, caché desactivada/CPU x4, imágenes lentas y movimiento reducido; Gift Box probada sin habilitarla al público.

- [x] Corregir entrada temporal de la primera colección y entrada visible de tarjetas en celular; verificado en Chromium/WebKit con touch, carga tardía, scroll rápido, movimiento reducido y alturas móviles.
- [x] Encabezados de colección con animación propia sincronizada con las tarjetas y tamaño de tarjeta uniforme en todas las colecciones salvo Favoritos.
- [x] Adelantar aparición individual y precarga de tarjetas en Inicio, Cupones y Categorías; conservar primera fila y verificar scroll rápido a 390/1280px, imágenes lentas y movimiento reducido.

- [x] Animar la presentación de Gift Box con la secuencia existente y conservar sus saltos de línea.
- [x] Verificar el pie único compartido en páginas públicas, navegación y separación de la barra Gift Box a 360px.

- [x] Comparar y corregir tipografía y dimensiones respecto de la referencia anterior a Linear, sin alterar movimiento ni imágenes.

- [x] Ajustes puntuales: logotipo con filtros, sobretítulo del slider, halo y etiqueta Pro, nombres Gift Box; verificar 360/390/768/1280.

- [x] Crear sistema visual y marco público global sin afectar `/admin/*`
- [x] Conectar navegación, búsqueda, Gift Box condicional y footer
- [x] Implementar carrusel Premium independiente de ubicación
- [x] Implementar filtros sticky con geolocalización, multiselección, rubro y cupones
- [x] Crear todas las rutas públicas con metadata propia
- [x] Verificar navegación, filtros, móvil, escritorio y rutas admin
- [x] Unificar toda la marca visible y los metadatos a AUNA
- [x] Corregir inconsistencias de jerarquía y adaptación móvil antes del lanzamiento
- [x] Validar Gift Box, Huella Solidaria y recorridos públicos/admin en celular y escritorio
- [x] Rediseñar Home con slider Premium, favoritos y colecciones de datos reales
- [x] Conservar localidades activas al abrir la grilla desde cada carrusel
- [x] Etiquetar comercios de prueba y validar filas vacías, límites y navegación
- [x] Unificar la navegación y los filtros públicos con las 12 colecciones

- [x] Colecciones propias por promoción, sección de Eventos y Top Slider unificado (promo o evento)
- [x] Animaciones ligadas al scroll (CSS nativo) con alternativa para navegadores sin soporte
- [x] og:image con dominio propio
- [ ] Íconos en círculo en los campos de formularios
- [ ] Isotipo como indicador de carga
- [x] Refactorización visual completa (Inter, fondo claro, barra transparente, tarjetas con desenfoque progresivo, pie con filete)
- [x] Sistema de animaciones de entrada estilo Linear (Reveal/RevealGroup, transición de página, stagger, reduced-motion)
