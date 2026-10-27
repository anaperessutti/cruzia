# Medidas de imágenes recomendadas — Cruzia

Guía rápida para cargar imágenes desde el panel de administración
(`/admin/comercios`). Todas las medidas están en píxeles (px) y pensadas para
pantallas de alta densidad (se suben al doble del tamaño visible).

| Uso | Medida recomendada | Proporción | Peso máx. | Formato |
| --- | --- | --- | --- | --- |
| **Hero Banner** (Top Slider de la portada, exclusivo Premium) | 1600 × 900 px | 16:9 | 400 KB | JPG (o WebP) |
| **Portada de tarjeta** (primera foto de la galería, se ve en la grilla de comercios) | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Fotos de galería** (ficha del comercio) | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Flyer de cupón / promoción** (es la portada de la tarjeta en la grilla) | 1200 × 800 px | 3:2 | 300 KB | JPG (o PNG si tiene texto fino) |
| **Logo del comercio** | 512 × 512 px | 1:1 | 150 KB | PNG con fondo transparente |
| **Fotos de Huella Solidaria** | 1200 × 800 px | 3:2 | 300 KB | JPG |
| **Portada de experiencia Gift Box** | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Galería de experiencia Gift Box** | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Portada de la presentación del regalo** (también vista previa en WhatsApp) | 1200 × 630 px | 1.91:1 | 300 KB | JPG |
| **Logo de la presentación del regalo** (versión clara, fondo oscuro) | 600 × 200 px | 3:1 | 150 KB | PNG transparente |
| **Fondo de la presentación del regalo** | 1600 × 2000 px | 4:5 | 400 KB | JPG |

## Recomendaciones

- **Zona segura:** en el Hero Banner, dejá los bordes (unos 120 px de cada
  lado) libres de texto o caras importantes: en celulares la imagen se recorta
  a los costados.
- **La primera foto de la galería es la portada** de la tarjeta en la grilla.
  Elegí la más representativa y con buena luz.
- **Peso:** el bucket acepta hasta 10 MB por archivo, pero conviene no pasar de
  400 KB para que la app cargue rápido en datos móviles.
- **Nada de capturas de pantalla ni fotos con marcas de agua de terceros.**
- **Zona segura de flyers (4:5, 1080 × 1350 px):** el texto importante va en el
  65% superior. El 35% inferior queda reservado para el panel de la tarjeta.
- **Texto dentro de la imagen:** solo en flyers de cupones; en el resto el texto
  va en los campos del formulario (se ve mejor y funciona para el buscador).

## Notas técnicas

- Las imágenes se guardan en el bucket privado `medios` de Lovable Cloud y se
  referencian con links firmados de larga duración (10 años).
- Las subidas están limitadas a cuentas con rol de administración; la lectura es
  pública, para que las fotos se vean en la app sin necesidad de iniciar sesión.
