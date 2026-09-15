
WITH nuevos AS (
  INSERT INTO public.comercios (nombre, plan_id, localidad_id, rubro_id, descripcion, direccion, lat, lng, horarios, whatsapp, galeria, activo)
  VALUES
  ('Panadería La Ribera',
   (SELECT id FROM public.planes WHERE nombre='Básico'),
   (SELECT id FROM public.localidades WHERE nombre='Santa Teresita'),
   (SELECT id FROM public.rubros WHERE nombre='Gastronomía'),
   '[DATOS DE PRUEBA] Panadería artesanal con facturas, pan de campo y café de especialidad frente al mar.',
   'Av. Costanera 1240, Santa Teresita', -36.5450, -56.6870, 'Lun a Dom 7:00 a 20:00', '+54 9 2246 555101',
   ARRAY['https://placehold.co/800x600?text=Panaderia+La+Ribera'], true),

  ('Marea Indumentaria',
   (SELECT id FROM public.planes WHERE nombre='Básico'),
   (SELECT id FROM public.localidades WHERE nombre='San Bernardo'),
   (SELECT id FROM public.rubros WHERE nombre='Indumentaria y Compras'),
   '[DATOS DE PRUEBA] Ropa de playa, lycras y accesorios de verano para toda la familia.',
   'Chiozza 2135, San Bernardo', -36.6930, -56.6760, 'Lun a Dom 10:00 a 22:00', '+54 9 2257 555102',
   ARRAY['https://placehold.co/800x600?text=Marea+Indumentaria'], true),

  ('Parrilla El Muelle',
   (SELECT id FROM public.planes WHERE nombre='Pro'),
   (SELECT id FROM public.localidades WHERE nombre='Santa Teresita'),
   (SELECT id FROM public.rubros WHERE nombre='Gastronomía'),
   '[DATOS DE PRUEBA] Parrilla familiar con pescados frescos, pastas caseras y vista al muelle.',
   'Calle 37 y Costanera, Santa Teresita', -36.5410, -56.6905, 'Mar a Dom 12:00 a 16:00 y 20:00 a 00:00', '+54 9 2246 555103',
   ARRAY['https://placehold.co/800x600?text=Parrilla+El+Muelle'], true),

  ('Surf School Costa Viva',
   (SELECT id FROM public.planes WHERE nombre='Pro'),
   (SELECT id FROM public.localidades WHERE nombre='Mar de Ajó'),
   (SELECT id FROM public.rubros WHERE nombre='Entretenimiento y Playa'),
   '[DATOS DE PRUEBA] Escuela de surf y alquiler de tablas con instructores certificados.',
   'Bajada 12, Playa Norte, Mar de Ajó', -36.7180, -56.6700, 'Lun a Dom 9:00 a 19:00', '+54 9 2257 555104',
   ARRAY['https://placehold.co/800x600?text=Surf+School+Costa+Viva'], true),

  ('Hotel Bahía Serena',
   (SELECT id FROM public.planes WHERE nombre='Premium'),
   (SELECT id FROM public.localidades WHERE nombre='San Bernardo'),
   (SELECT id FROM public.rubros WHERE nombre='Alojamiento'),
   '[DATOS DE PRUEBA] Hotel boutique a dos cuadras del mar, con pileta climatizada y desayuno buffet.',
   'Av. Costanera 3480, San Bernardo', -36.6975, -56.6790, 'Recepción 24 hs', '+54 9 2257 555105',
   ARRAY['https://placehold.co/800x600?text=Hotel+Bahia+Serena'], true),

  ('Club Nocturno Horizonte',
   (SELECT id FROM public.planes WHERE nombre='Premium'),
   (SELECT id FROM public.localidades WHERE nombre='Mar de Ajó'),
   (SELECT id FROM public.rubros WHERE nombre='Eventos y Noche'),
   '[DATOS DE PRUEBA] Bar y pista de baile frente al mar, con shows en vivo los fines de semana.',
   'Av. Costanera 150, Mar de Ajó', -36.7220, -56.6725, 'Jue a Dom 23:00 a 06:00', '+54 9 2257 555106',
   ARRAY['https://placehold.co/800x600?text=Club+Horizonte'], true)
  RETURNING id, nombre
)
INSERT INTO public.cupones (comercio_id, titulo, descripcion, flyer_url, vigencia_inicio, vigencia_fin, modalidad, cooldown_dias, activo)
SELECT n.id, c.titulo, c.descripcion, c.flyer, CURRENT_DATE - 5, CURRENT_DATE + 60, c.modalidad::modalidad_cupon, 7, true
FROM nuevos n
JOIN (VALUES
  ('Parrilla El Muelle', '2x1 en entradas', '[DATOS DE PRUEBA] Presentá el cupón en el local y llevate 2x1 en entradas frías.', 'https://placehold.co/600x800?text=Cupon+El+Muelle', 'presencial'),
  ('Surf School Costa Viva', '20% off en clase de surf', '[DATOS DE PRUEBA] Reservá por WhatsApp tu clase grupal con 20% de descuento.', 'https://placehold.co/600x800?text=Cupon+Surf', 'whatsapp'),
  ('Hotel Bahía Serena', 'Late check-out sin cargo', '[DATOS DE PRUEBA] Reservá por WhatsApp y pedí tu late check-out hasta las 15 hs.', 'https://placehold.co/600x800?text=Cupon+Bahia+Serena', 'whatsapp'),
  ('Club Nocturno Horizonte', 'Entrada libre antes de la 1 AM', '[DATOS DE PRUEBA] Mostrá el cupón en puerta y entrá sin cargo antes de la 1 AM.', 'https://placehold.co/600x800?text=Cupon+Horizonte', 'presencial')
) AS c(comercio, titulo, descripcion, flyer, modalidad) ON c.comercio = n.nombre;
