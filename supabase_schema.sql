-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  time_worked NUMERIC NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- The first user to register becomes the admin
  INSERT INTO public.profiles (id, is_admin)
  VALUES (
    new.id,
    NOT EXISTS (SELECT 1 FROM public.profiles)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger to call the function on signup
-- Note: We drop it first to avoid errors if the script is re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- CLIENTS POLICIES
DROP POLICY IF EXISTS "Allow all access" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated select on clients" ON public.clients;
CREATE POLICY "Allow authenticated select on clients" 
ON public.clients FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow admin all on clients" ON public.clients;
CREATE POLICY "Allow admin all on clients" 
ON public.clients FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = TRUE
  )
);

-- SERVICES POLICIES
DROP POLICY IF EXISTS "Allow all access" ON public.services;
DROP POLICY IF EXISTS "Allow authenticated select on services" ON public.services;
CREATE POLICY "Allow authenticated select on services" 
ON public.services FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow admin all on services" ON public.services;
CREATE POLICY "Allow admin all on services" 
ON public.services FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = TRUE
  )
);
