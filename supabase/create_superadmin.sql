-- Create Superadmin User
-- Run this in Supabase SQL Editor after creating the user in Auth

-- Step 1: First, create a user in Supabase Dashboard:
-- 1. Go to your Supabase project: https://supabase.com/dashboard
-- 2. Click on "Authentication" in the left sidebar
-- 3. Click on "Users" tab
-- 4. Click "Add User" button
-- 5. Enter:
--    - Email: your-email@example.com
--    - Password: your-secure-password
--    - Check "Auto Confirm User" (important!)
-- 6. Click "Create User"

-- Step 2: After creating the user, copy their User ID from the users table
-- Then run this SQL to set them as superadmin:

-- Replace 'USER_ID_HERE' with the actual UUID from the auth.users table
UPDATE profiles 
SET role = 'superadmin' 
WHERE id = 'USER_ID_HERE';

-- To verify the role was set correctly:
SELECT 
  p.id,
  p.role,
  u.email,
  u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'superadmin';

-- Alternative: If you know the email address, you can use this:
-- UPDATE profiles 
-- SET role = 'superadmin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
