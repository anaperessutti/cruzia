# Navegación y estructura pública de OLA!

## Objetivo
Construir la base navegable mobile-first de OLA! con identidad “Club de playa”: azul profundo, coral y celeste; títulos Sora, textos Manrope; composición asimétrica, clara y premium.

## Qué se va a construir
- Reemplazar la portada vacía por una experiencia real con carrusel superior, filtros y una primera grilla de comercios.
- Incorporar una cabecera pública fija con logo OLA!, búsqueda rápida, enlace externo a Instagram y menú hamburguesa completo. No tendrá ubicación ni referencias a ella.
- Crear páginas independientes para Inicio, Cupones, Categorías, Gift Box, ¿Quiénes Somos?, Huella Solidaria, Subite a la Ola, Contacto, Privacidad y Términos de Promociones.
- Mantener las pantallas `/admin/*` sin la cabecera, filtros ni pie públicos.
- Agregar un pie global con @somos_auna, auna.comunidad@gmail.com y enlaces legales.

## Datos y reglas
- Consultar localidades, rubros, comercios, cupones, planes y configuración desde Lovable Cloud.
- Mostrar Gift Box en navegación y permitir su acceso únicamente cuando `gift_box_visible` sea verdadero; si está oculto, su ruta volverá al inicio.
- Elegir comercios del carrusel según `aparece_en_hero_banner`, ordenarlos por `prioridad_orden` y sumar una pieza propia “Subite a la Ola”. El carrusel no responderá al filtro de ubicación.
- La opción Cupones activará directamente el estado “Solo con Cupón” y mostrará comercios con promoción vigente.
- La jerarquía visual Premium > Pro > Básico se determinará por los atributos del plan, no por nombres codificados.

## Filtros y búsqueda
- Crear una barra sticky como única fuente de ubicación: multiselección de localidades, rubro y switch “Solo con Cupón”.
- Intentar geolocalización al ingresar y preseleccionar la localidad más cercana usando las coordenadas de comercios disponibles; si no hay permiso o datos suficientes, dejar la selección abierta para elección manual.
- Permitir sumar o quitar varias localidades sin reemplazar automáticamente la selección del usuario.
- Abrir la búsqueda rápida desde la lupa y buscar por comercio, categoría o localidad, con enlaces a resultados relevantes.
- Compartir los filtros entre Inicio, Cupones y Categorías para conservar la selección durante la navegación pública.

## Presentación
- Definir tokens semánticos para azul profundo, coral, celeste y fondo claro, con contraste accesible y sin colores sueltos en las páginas.
- Cargar Sora y Manrope desde el encabezado del documento.
- Usar imágenes reales de los comercios cuando existan; para estados sin contenido, usar composiciones de marca limpias sin inventar negocios.
- Incorporar transiciones breves y respetar la preferencia de movimiento reducido.
- Adaptar cabecera, menú, carrusel, filtros, grillas y pie a móvil y escritorio sin superposiciones.

## Páginas iniciales
- Inicio: carrusel, filtros y directorio filtrable.
- Cupones: mismo directorio con “Solo con Cupón” activo.
- Categorías: exploración por los rubros reales de la base.
- Gift Box: acceso gobernado por configuración; contenido introductorio provisional si se habilita.
- ¿Quiénes Somos?, Huella Solidaria, Subite a la Ola y Contacto: páginas iniciales coherentes con su propósito, sin completar todavía flujos de formularios no solicitados.
- Privacidad y Términos de Promociones: placeholders claramente identificados.

## Verificación
- Comprobar navegación completa, apertura/cierre de búsqueda y menú, filtros múltiples, estado de Cupones y ocultamiento de Gift Box.
- Revisar visualmente móvil y escritorio, además de validar que las pantallas administrativas sigan funcionando aisladas.
- Añadir títulos y descripciones propios para cada página pública.
