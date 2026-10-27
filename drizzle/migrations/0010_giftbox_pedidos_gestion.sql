ALTER TYPE public.giftbox_estado ADD VALUE IF NOT EXISTS 'contactado' AFTER 'pendiente';
ALTER TABLE public.giftbox_pedidos
  ADD COLUMN IF NOT EXISTS link_pago text,
  ADD COLUMN IF NOT EXISTS notas_internas text,
  ADD COLUMN IF NOT EXISTS token_formulario uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS token_regalo uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS mensaje_pago_enviado_at timestamptz,
  ADD COLUMN IF NOT EXISTS pagado_at timestamptz,
  ADD COLUMN IF NOT EXISTS regalo_enviado_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS giftbox_pedidos_token_formulario_key ON public.giftbox_pedidos(token_formulario);
CREATE UNIQUE INDEX IF NOT EXISTS giftbox_pedidos_token_regalo_key ON public.giftbox_pedidos(token_regalo);
ALTER TABLE public.configuracion_global
  ADD COLUMN IF NOT EXISTS giftbox_plantilla_pago text NOT NULL DEFAULT E'Hola! Tu Gift Box está en proceso🎁\n\n1. Ingresá a este link para realizar el pago: {link_pago}\n2. Completá este breve formulario con los datos del agasajado, la ocasión y tu mensaje de regalo: {link_formulario}\n\n{nota_fisico}',
  ADD COLUMN IF NOT EXISTS giftbox_plantilla_regalo text NOT NULL DEFAULT E'¡Hola {agasajado}! 🎁 {remitente} te regaló una Gift Box de Cruzia. Abrí tu regalo acá: {link_regalo}';