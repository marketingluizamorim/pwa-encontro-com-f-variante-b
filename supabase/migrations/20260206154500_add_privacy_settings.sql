ALTER TABLE "public"."profiles"
ADD COLUMN "show_online_status" boolean DEFAULT true,
ADD COLUMN "show_last_active" boolean DEFAULT true,
ADD COLUMN "show_distance" boolean DEFAULT true,
ADD COLUMN "show_read_receipts" boolean DEFAULT true;
