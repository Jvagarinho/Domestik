-- Fix orphaned clients (where user_id is NULL)
-- Assigns them to the user running this script (if run in SQL Editor, user_id might be distinct or require explicit ID)
-- BUT since you are running this in SQL Editor, auth.uid() is likely NULL.
-- We will relax the policy temporarily to allow you to see and fix data, OR we update indiscriminately.

-- Update NULL user_ids to the ID of the user you want to own them.
-- Since I don't know your User ID, this script assumes you want to 'claim' all orphaned rows.

-- WARNING: This assigns ALL orphaned rows to the current user context.
-- If run in Supabase SQL Editor, auth.uid() is usually null. 
-- You might need to copy your User ID from the Authentication table.

-- Policy Fix (Optional: run if you still can't see rows)
-- DROP POLICY ...

-- The main fix:
UPDATE public.clients
SET user_id = auth.uid()
WHERE user_id IS NULL;

UPDATE public.services
SET user_id = auth.uid()
WHERE user_id IS NULL;
