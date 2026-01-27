-- Add src and sck columns to purchases table for UTMify tracking
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS src text;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS sck text;