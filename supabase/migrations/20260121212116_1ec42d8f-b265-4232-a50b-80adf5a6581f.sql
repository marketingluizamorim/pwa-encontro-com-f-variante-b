-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Create enum for swipe direction
CREATE TYPE public.swipe_direction AS ENUM ('like', 'dislike', 'super_like');

-- =====================================================
-- USER ROLES TABLE (for admin access control)
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PURCHASES TABLE (payment records)
-- =====================================================
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  user_cpf TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  order_bumps JSONB DEFAULT '[]'::jsonb,
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'PIX',
  source_platform TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  quiz_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Allow insert without auth (for guest checkout before registration)
CREATE POLICY "Allow guest purchase creation"
  ON public.purchases FOR INSERT
  WITH CHECK (true);

-- Admins can view all purchases
CREATE POLICY "Admins can view all purchases"
  ON public.purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update purchases
CREATE POLICY "Admins can update purchases"
  ON public.purchases FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- PROFILES TABLE (user dating profiles)
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  city TEXT,
  state TEXT,
  religion TEXT,
  church_frequency TEXT,
  looking_for TEXT,
  looking_for_goals TEXT,
  about_children TEXT,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  avatar_url TEXT,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_profile_complete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view active profiles (for discovery)
CREATE POLICY "Users can view active profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.purchases(id),
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_lifetime BOOLEAN DEFAULT false,
  has_all_regions BOOLEAN DEFAULT false,
  can_see_who_liked BOOLEAN DEFAULT false,
  can_use_advanced_filters BOOLEAN DEFAULT false,
  can_video_call BOOLEAN DEFAULT false,
  is_profile_boosted BOOLEAN DEFAULT false,
  daily_swipes_limit INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SWIPES TABLE (likes/dislikes)
-- =====================================================
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (swiper_id, swiped_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes"
  ON public.swipes FOR SELECT
  TO authenticated
  USING (auth.uid() = swiper_id);

-- Users can create swipes
CREATE POLICY "Users can create swipes"
  ON public.swipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = swiper_id);

-- Users can update their own swipes
CREATE POLICY "Users can update own swipes"
  ON public.swipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = swiper_id);

-- =====================================================
-- MATCHES TABLE (mutual likes)
-- =====================================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  unmatched_at TIMESTAMP WITH TIME ZONE,
  unmatched_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own matches
CREATE POLICY "Users can view own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update their own matches (unmatch)
CREATE POLICY "Users can update own matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- =====================================================
-- MESSAGES TABLE (chat messages)
-- =====================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is part of a match
CREATE OR REPLACE FUNCTION public.is_match_participant(_user_id UUID, _match_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches
    WHERE id = _match_id
      AND (user1_id = _user_id OR user2_id = _user_id)
      AND is_active = true
  )
$$;

-- Users can view messages from their matches
CREATE POLICY "Users can view match messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_match_participant(auth.uid(), match_id));

-- Users can send messages in their matches
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id 
    AND public.is_match_participant(auth.uid(), match_id)
  );

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    public.is_match_participant(auth.uid(), match_id)
    AND sender_id != auth.uid()
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically create match when both users like each other
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_exists BOOLEAN;
  v_user1 UUID;
  v_user2 UUID;
BEGIN
  -- Only check for matches on 'like' or 'super_like'
  IF NEW.direction = 'dislike' THEN
    RETURN NEW;
  END IF;

  -- Check if the other person already liked the swiper
  SELECT EXISTS (
    SELECT 1 FROM public.swipes
    WHERE swiper_id = NEW.swiped_id
      AND swiped_id = NEW.swiper_id
      AND direction IN ('like', 'super_like')
  ) INTO v_match_exists;

  IF v_match_exists THEN
    -- Ensure consistent ordering (user1_id < user2_id)
    IF NEW.swiper_id < NEW.swiped_id THEN
      v_user1 := NEW.swiper_id;
      v_user2 := NEW.swiped_id;
    ELSE
      v_user1 := NEW.swiped_id;
      v_user2 := NEW.swiper_id;
    END IF;

    -- Create match if it doesn't exist
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (v_user1, v_user2)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to check for matches on new swipes
CREATE TRIGGER on_swipe_check_match
  AFTER INSERT ON public.swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_for_match();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for messages (for chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;