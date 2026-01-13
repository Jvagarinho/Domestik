-- Create clients table
CREATE TABLE domestik_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE domestik_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  client_id UUID REFERENCES domestik_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  time_worked NUMERIC NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS domestik_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Always make the user an admin
  INSERT INTO public.domestik_profiles (id, is_admin)
  VALUES (new.id, TRUE);
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
ALTER TABLE domestik_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domestik_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE domestik_services ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.domestik_profiles;
CREATE POLICY "Users can view their own profile" 
ON public.domestik_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- CLIENTS POLICIES
DROP POLICY IF EXISTS "Allow all access" ON public.domestik_clients;
DROP POLICY IF EXISTS "Allow authenticated select on clients" ON public.domestik_clients;
DROP POLICY IF EXISTS "Allow admin all on clients" ON public.domestik_clients;
DROP POLICY IF EXISTS "Users can only access their own clients" ON public.domestik_clients;

CREATE POLICY "Users can only access their own clients" 
ON public.domestik_clients FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- SERVICES POLICIES
DROP POLICY IF EXISTS "Allow all access" ON public.domestik_services;
DROP POLICY IF EXISTS "Allow authenticated select on services" ON public.domestik_services;
DROP POLICY IF EXISTS "Allow admin all on services" ON public.domestik_services;
DROP POLICY IF EXISTS "Users can only access their own services" ON public.domestik_services;

CREATE POLICY "Users can only access their own services" 
ON public.domestik_services FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);
