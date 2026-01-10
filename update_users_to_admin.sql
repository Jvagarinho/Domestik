-- Update the handle_new_user function to always make users admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Always make the user an admin
  INSERT INTO public.profiles (id, is_admin)
  VALUES (new.id, TRUE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update all existing profiles to be admins
UPDATE public.profiles
SET is_admin = TRUE;
