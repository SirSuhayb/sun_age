-- Add a new RLS policy to the profiles table
-- Example: Allow anyone to SELECT all profiles
CREATE POLICY "Anyone can view all profiles" ON profiles
  FOR SELECT USING (true);

-- To use a different policy, edit the USING clause above. 