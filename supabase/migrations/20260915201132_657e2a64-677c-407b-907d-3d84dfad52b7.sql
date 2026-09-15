ALTER TABLE public.huella_solidaria_fases ADD COLUMN IF NOT EXISTS publicado boolean NOT NULL DEFAULT false;
UPDATE public.huella_solidaria_fases SET publicado = false;