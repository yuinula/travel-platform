-- Create Hidden Gems Library
CREATE TABLE public.hidden_gems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT, -- e.g., 'Food', 'Culture', 'Nature'
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Trip Itineraries (Modular)
CREATE TABLE public.itinerary_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  gem_id UUID REFERENCES public.hidden_gems(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  location TEXT,
  time_slot TEXT, -- e.g., 'Morning', 'Afternoon', 'Evening'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Hidden Gems
ALTER TABLE public.hidden_gems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hidden gems are viewable by everyone." ON public.hidden_gems FOR SELECT USING (true);
CREATE POLICY "Guides can create their own hidden gems." ON public.hidden_gems FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS for Itinerary Items
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can see itinerary items." ON public.itinerary_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = itinerary_items.trip_id
    AND (trips.traveler_id = auth.uid() OR trips.guide_id = auth.uid())
  )
);
CREATE POLICY "Guides can manage itinerary items." ON public.itinerary_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.trips
    WHERE trips.id = itinerary_items.trip_id
    AND trips.guide_id = auth.uid()
  )
);
