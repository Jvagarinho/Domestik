-- Add user_id to clients
ALTER TABLE IF EXISTS public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Add user_id to services
ALTER TABLE IF EXISTS public.services 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update RLS for clients to strict ownership
DROP POLICY IF EXISTS "Allow authenticated select on clients" ON public.clients;
DROP POLICY IF EXISTS "Allow admin all on clients" ON public.clients;

CREATE POLICY "Users can only access their own clients" 
ON public.clients FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Update RLS for services to strict ownership
DROP POLICY IF EXISTS "Allow authenticated select on services" ON public.services;
DROP POLICY IF EXISTS "Allow admin all on services" ON public.services;

CREATE POLICY "Users can only access their own services" 
ON public.services FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);
