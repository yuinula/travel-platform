-- Create Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('traveler', 'guide')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create GuideProfiles table
CREATE TABLE public.guide_profiles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  languages TEXT[],
  service_areas TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate NUMERIC,
  rating_avg NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0
);

-- Create Trips (Orders) table
CREATE TYPE trip_status AS ENUM ('Draft', 'Negotiation', 'Booked', 'In-Progress', 'Completed', 'Settled');

CREATE TABLE public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id UUID REFERENCES public.profiles(id),
  guide_id UUID REFERENCES public.profiles(id),
  status trip_status DEFAULT 'Draft',
  total_price NUMERIC,
  deposit_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view all, but only edit their own
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- GuideProfiles: Users can view all, but only guides edit their own
CREATE POLICY "Guide profiles are viewable by everyone." ON public.guide_profiles FOR SELECT USING (true);
CREATE POLICY "Guides can update own profile." ON public.guide_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Trips: Users can only see trips they are part of
CREATE POLICY "Users can see their own trips." ON public.trips FOR SELECT USING (auth.uid() = traveler_id OR auth.uid() = guide_id);
CREATE POLICY "Travelers can create trips." ON public.trips FOR INSERT WITH CHECK (auth.uid() = traveler_id);
CREATE POLICY "Participants can update trips." ON public.trips FOR UPDATE USING (auth.uid() = traveler_id OR auth.uid() = guide_id);

-- Messages: Users can see messages for trips they are part of
CREATE POLICY "Users can see messages for their trips." ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = messages.trip_id
    AND (trips.traveler_id = auth.uid() OR trips.guide_id = auth.uid())
  )
);
CREATE POLICY "Participants can send messages." ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = messages.trip_id
    AND (trips.traveler_id = auth.uid() OR trips.guide_id = auth.uid())
  )
);

-- Reviews: Viewable by all, created by travelers of completed trips
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Travelers can review completed trips." ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = reviews.trip_id
    AND trips.traveler_id = auth.uid()
    AND trips.status = 'Completed'
  )
);
