-- Make a user admin in Ahauros Dashboard
-- Run this in Supabase SQL Editor

-- Replace 'user@example.com' with the actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'test@ahauros.io';

-- Verify the change
SELECT email, role, created_at 
FROM profiles 
WHERE email = 'test@ahauros.io';

-- List all admin users
SELECT email, role, created_at 
FROM profiles 
WHERE role = 'admin';

