-- Create table for user blocks
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Policies for user_blocks
CREATE POLICY "Users can view their own blocks"
ON public.user_blocks
FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
ON public.user_blocks
FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
ON public.user_blocks
FOR DELETE
USING (auth.uid() = blocker_id);

-- Create table for user reports
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policies for user_reports
CREATE POLICY "Users can create reports"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.user_reports
FOR SELECT
USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
ON public.user_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
ON public.user_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Create function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(blocker_id UUID, blocked_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (user_blocks.blocker_id = $1 AND user_blocks.blocked_id = $2)
       OR (user_blocks.blocker_id = $2 AND user_blocks.blocked_id = $1)
  )
$$;

-- Create indexes for performance
CREATE INDEX idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON public.user_blocks(blocked_id);
CREATE INDEX idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX idx_user_reports_status ON public.user_reports(status);