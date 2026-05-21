-- Refined function to handle new user creation (handles Google and Email signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Determine role: prefer metadata, fallback to 'traveler'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'traveler');
  
  -- Determine name: Google uses 'full_name' or 'name', standard uses 'name'
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1) -- Fallback to email prefix
  );
  
  -- Determine avatar: Google uses 'avatar_url' or 'picture'
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_avatar,
    lower(user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  -- If the role is guide, also create a entry in guide_profiles
  IF (lower(user_role) = 'guide') THEN
    INSERT INTO public.guide_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
