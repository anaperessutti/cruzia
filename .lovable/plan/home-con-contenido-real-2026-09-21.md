# Home con contenido real

## Objetivo
Reemplazar la grilla principal del Home por un recorrido editorial: slider Premium, Favoritos de la Costa y filas de colecciones, conservando intacta la grilla tradicional en sus páginas actuales.

## Implementación
- Ampliar la carga pública para incluir las 12 colecciones y sus relaciones con comercios.
- Mantener únicamente comercios activos y promociones activas y vigentes en las filas del Home.
- Ajustar el slider grande Premium a un máximo de 7 comercios, sorteados nuevamente al entrar al Home, respetando el alcance por localidades activas.
- Crear una tarjeta reutilizable basada en el mismo tratamiento visual de la grilla tradicional.
- Construir “Favoritos de la Costa” solo cuando existan promociones marcadas, una tarjeta por promoción.
- Construir una fila por colección con una tarjeta por promoción activa o una sola tarjeta básica cuando el comercio no tenga promociones.
- Mantener el orden fijo de las 12 colecciones y ocultar las filas vacías.
- Hacer que los títulos y “Ver todo” abran la grilla tradicional con el filtro correspondiente; los enlaces conservarán las localidades activas.
- Leer esos filtros desde la URL en la página de categorías y cupones para que lleguen aplicados.
- Asignar colecciones representativas a los comercios de prueba y marcar promociones vigentes de prueba como favoritas para poder revisar el resultado.

## Validación
- Confirmar en escritorio y celular que el Home conserva el slider grande y muestra solo filas con contenido.
- Verificar navegación a la grilla con colección, “Solo con Cupón” y localidades activas.
- Confirmar que cada carrusel conserva el límite de 10 tarjetas y “Ver todo” en la posición 11.
