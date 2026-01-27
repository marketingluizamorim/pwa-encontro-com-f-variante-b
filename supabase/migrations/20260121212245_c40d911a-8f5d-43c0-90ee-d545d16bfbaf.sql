-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow guest purchase creation" ON public.purchases;

-- Create a more restrictive policy for guest purchases
-- Only service role (edge functions) can insert purchases
-- This is secure because edge functions handle the purchase creation
CREATE POLICY "Service role can create purchases"
  ON public.purchases FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also allow authenticated users to have their purchases linked
CREATE POLICY "Users can update their own purchases"
  ON public.purchases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);