-- Prioritizar perfis com Plano Ouro na descoberta
CREATE OR REPLACE FUNCTION public.get_profiles_discovery(
  user_lat double precision,
  user_lon double precision,
  min_age integer,
  max_age integer,
  max_dist_km double precision DEFAULT 500,
  target_state text DEFAULT NULL::text,
  target_city text DEFAULT NULL::text,
  target_religion text DEFAULT NULL::text,
  target_church_frequency text DEFAULT NULL::text,
  target_looking_for text DEFAULT NULL::text,
  target_interests text[] DEFAULT NULL::text[],
  excluded_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  LEFT JOIN (
    SELECT user_id, MIN(
      CASE 
        WHEN plan_id = 'gold' THEN 1
        WHEN plan_id = 'silver' THEN 2
        WHEN plan_id = 'bronze' THEN 3
        ELSE 4 
      END
    ) as priority
    FROM public.user_subscriptions
    WHERE is_active = true
    GROUP BY user_id
  ) s ON p.user_id = s.user_id
  WHERE p.is_active = true
    AND p.is_profile_complete = true
    AND NOT (p.user_id = ANY(excluded_ids))
    -- Filters
    AND (target_state IS NULL OR target_state = '' OR p.state = target_state)
    AND (target_city IS NULL OR target_city = '' OR p.city ILIKE '%' || target_city || '%')
    AND (target_religion IS NULL OR target_religion = '' OR p.religion = target_religion)
    AND (target_church_frequency IS NULL OR target_church_frequency = '' OR p.church_frequency = target_church_frequency)
    AND (target_looking_for IS NULL OR target_looking_for = '' OR p.looking_for = target_looking_for)
    AND (target_interests IS NULL OR CARDINALITY(target_interests) = 0 OR p.christian_interests @> target_interests)
    -- Age filter
    AND (
      p.birth_date >= (CURRENT_DATE - (max_age + 1) * INTERVAL '1 year')
      AND p.birth_date <= (CURRENT_DATE - min_age * INTERVAL '1 year')
    )
    -- Distance filter (only if user provided lat/lon)
    AND (
      (user_lat IS NULL OR user_lon IS NULL OR p.latitude IS NULL OR p.longitude IS NULL)
      OR
      (ST_DistanceSphere(ST_MakePoint(user_lon, user_lat), ST_MakePoint(p.longitude, p.latitude)) / 1000 <= max_dist_km)
    )
  ORDER BY 
    COALESCE(s.priority, 4) ASC,
    p.last_active_at DESC;
END;
$$;
