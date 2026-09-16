# Medidas de imágenes recomendadas — AUNA / OLA!

Guía rápida para cargar imágenes desde el panel de administración
(`/admin/comercios`). Todas las medidas están en píxeles (px) y pensadas para
pantallas de alta densidad (se suben al doble del tamaño visible).

| Uso | Medida recomendada | Proporción | Peso máx. | Formato |
| --- | --- | --- | --- | --- |
| **Hero Banner** (Top Slider de la portada, exclusivo Premium) | 1600 × 900 px | 16:9 | 400 KB | JPG (o WebP) |
| **Portada de tarjeta** (primera foto de la galería, se ve en la grilla de comercios) | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Fotos de galería** (ficha del comercio) | 1200 × 800 px | 3:2 | 300 KB | JPG (o WebP) |
| **Flyer de cupón / promoción** | 1080 × 1350 px | 4:5 (vertical, estilo Instagram) | 400 KB | JPG (o PNG si tiene texto fino) |
| **Logo del comercio** | 512 × 512 px | 1:1 | 150 KB | PNG con fondo transparente |
| **Fotos de Huella Solidaria** | 1200 × 800 px | 3:2 | 300 KB | JPG |
| **Imágenes de ítems de Gift Box** | 800 × 800 px | 1:1 | 200 KB | JPG |

## Recomendaciones

- **Zona segura:** en el Hero Banner, dejá los bordes (unos 120 px de cada
  lado) libres de texto o caras importantes: en celulares la imagen se recorta
  a los costados.
- **La primera foto de la galería es la portada** de la tarjeta en la grilla.
  Elegí la más representativa y con buena luz.
- **Peso:** el bucket acepta hasta 10 MB por archivo, pero conviene no pasar de
  400 KB para que la app cargue rápido en datos móviles.
- **Nada de capturas de pantalla ni fotos con marcas de agua de terceros.**
- **Texto dentro de la imagen:** solo en flyers de cupones; en el resto el texto
  va en los campos del formulario (se ve mejor y funciona para el buscador).

## Notas técnicas

- Las imágenes se guardan en el bucket privado `medios` de Lovable Cloud y se
  referencian con links firmados de larga duración (10 años).
- Las subidas están limitadas a cuentas con rol de administración; la lectura es
  pública, para que las fotos se vean en la app sin necesidad de iniciar sesión.
