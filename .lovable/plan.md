# Ajuste del carrusel del Home

## Cambios
- Limitar `CarruselSeccion` a un máximo de 10 tarjetas recibidas, sin modificar sus tamaños responsivos.
- Agregar siempre al final una tarjeta “Ver todo” con ícono “+”, enlazada a `destinoUrl`.
- Eliminar el elemento “+” flotante/sticky actual.
- En desktop, reemplazarlo por un único indicador lateral con degradado y flecha para sugerir desplazamiento; ocultarlo cuando ya no haya contenido hacia la derecha.
- Mantener el desplazamiento móvil completamente natural, con “Ver todo” únicamente al final del recorrido.
- Ampliar `/demo-carrusel` a más de 10 tarjetas para comprobar el corte exacto.

## Verificación
- Confirmar en desktop y mobile que solo aparecen 10 tarjetas reales y que “Ver todo” ocupa la posición 11.
- Confirmar que los enlaces del título y de “Ver todo” conservan la URL con sus filtros.
- Confirmar que no cambian los anchos aprobados de las tarjetas.
