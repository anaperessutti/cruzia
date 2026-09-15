UPDATE public.huella_solidaria_fases
SET titulo = 'Nuestro próximo aporte',
    descripcion = 'Estamos recaudando fondos durante este año para equipar el club deportivo/comedor de [Localidad]',
    updated_at = now()
WHERE tipo = 'actual'::public.fase_tipo;

INSERT INTO public.huella_solidaria_fases (titulo, descripcion, fotos, fecha, tipo)
SELECT
  'Nuestro próximo aporte',
  'Estamos recaudando fondos durante este año para equipar el club deportivo/comedor de [Localidad]',
  ARRAY[]::text[],
  CURRENT_DATE,
  'actual'::public.fase_tipo
WHERE NOT EXISTS (
  SELECT 1 FROM public.huella_solidaria_fases WHERE tipo = 'actual'::public.fase_tipo
);

INSERT INTO public.huella_solidaria_fases (titulo, descripcion, fotos, fecha, tipo)
SELECT
  'Julio 2026: Donación de pintura para el refugio de animales de Santa Teresita',
  NULL,
  ARRAY['https://placehold.co/1200x800/6EC5E9/12355B?text=Refugio+de+animales']::text[],
  DATE '2026-07-01',
  'historial'::public.fase_tipo
WHERE NOT EXISTS (
  SELECT 1
  FROM public.huella_solidaria_fases
  WHERE titulo = 'Julio 2026: Donación de pintura para el refugio de animales de Santa Teresita'
    AND tipo = 'historial'::public.fase_tipo
);