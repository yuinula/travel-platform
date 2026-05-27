-- Sync runtime tables used by the current application UI.
-- This migration is intentionally additive so it can run against an existing
-- Supabase project that already has some of these tables.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_status') THEN
    CREATE TYPE trip_status AS ENUM ('Draft', 'Negotiation', 'Booked', 'In-Progress', 'Completed', 'Settled');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landmark_type') THEN
    CREATE TYPE landmark_type AS ENUM ('Sightseeing', 'Market', 'Restaurant', 'Accommodation', 'ArtGallery');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Sub Admin',
  permissions TEXT[] DEFAULT ARRAY['dashboard']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pax TEXT,
  needs TEXT[],
  interests TEXT[],
  pace TEXT
);

CREATE TABLE IF NOT EXISTS public.itinerary_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  morning TEXT,
  afternoon TEXT,
  evening TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.landmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  province TEXT,
  city TEXT NOT NULL,
  type landmark_type NOT NULL,
  features TEXT[],
  is_accessible BOOLEAN DEFAULT FALSE,
  is_child_friendly BOOLEAN DEFAULT FALSE,
  is_elder_friendly BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_username TEXT NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  content TEXT,
  image_url TEXT,
  type TEXT,
  price NUMERIC,
  deposit NUMERIC,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deposit NUMERIC;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS details TEXT;

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'itineraries' AND policyname = 'Users can manage own itineraries.') THEN
    CREATE POLICY "Users can manage own itineraries." ON public.itineraries
      FOR ALL USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'itinerary_details' AND policyname = 'Users can manage own itinerary details.') THEN
    CREATE POLICY "Users can manage own itinerary details." ON public.itinerary_details
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.itineraries
          WHERE itineraries.id = itinerary_details.itinerary_id
            AND itineraries.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.itineraries
          WHERE itineraries.id = itinerary_details.itinerary_id
            AND itineraries.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can see messages for their trips.') THEN
    CREATE POLICY "Users can see messages for their trips." ON public.messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.trips
          WHERE trips.id = messages.trip_id
            AND (trips.traveler_id = auth.uid() OR trips.guide_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Participants can send messages.') THEN
    CREATE POLICY "Participants can send messages." ON public.messages
      FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
          SELECT 1 FROM public.trips
          WHERE trips.id = messages.trip_id
            AND (trips.traveler_id = auth.uid() OR trips.guide_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Reviews are viewable by everyone.') THEN
    CREATE POLICY "Reviews are viewable by everyone." ON public.reviews
      FOR SELECT USING (TRUE);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reviews' AND policyname = 'Travelers can review completed trips.') THEN
    CREATE POLICY "Travelers can review completed trips." ON public.reviews
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.trips
          WHERE trips.id = reviews.trip_id
            AND trips.traveler_id = auth.uid()
            AND trips.status = 'Completed'
        )
      );
  END IF;
END $$;
