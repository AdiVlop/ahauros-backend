# Profiles System - Ahauros Dashboard

## Overview

The profiles system extends Supabase Auth with additional user data and role-based access control for the Ahauros Dashboard.

## Database Schema

### `profiles` Table

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```

#### Fields:
- **`id`**: Primary key, references `auth.users(id)`
- **`email`**: User's email address (synced from auth.users)
- **`role`**: User role (`user` or `admin`)
- **`created_at`**: Timestamp when profile was created

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Automatic Profile Creation

### Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

This ensures that every new user automatically gets a profile created when they sign up.

## Role Management

### Assigning Admin Role

#### Method 1: Supabase Dashboard
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user you want to make admin
3. Go to Database → profiles table
4. Update the `role` field to `admin`

#### Method 2: SQL Update
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@ahauros.io';
```

#### Method 3: API Call
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('email', 'admin@ahauros.io');
```

## Frontend Integration

### useProfile Hook

```javascript
import { useProfile } from '../hooks/useProfile';

function Dashboard() {
  const { profile, loading } = useProfile(userId);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {profile?.email}</h1>
      <p>Role: {profile?.role}</p>
    </div>
  );
}
```

### Role-Based UI

```javascript
const isAdmin = profile?.role === 'admin';

return (
  <div>
    {isAdmin ? (
      <AdminPanel />
    ) : (
      <UserDashboard />
    )}
  </div>
);
```

## Dashboard Features

### User Dashboard
- View personal information
- Access to user-specific features
- Basic analytics and settings

### Admin Dashboard
- All user features
- User management tools
- System settings
- Advanced analytics

## Security Considerations

1. **RLS Policies**: Ensure users can only access their own profile data
2. **Role Validation**: Always validate roles on the backend
3. **Session Management**: Use Supabase Auth session for user identification
4. **API Security**: Implement proper authorization checks

## Migration Notes

### Existing Users
For existing users without profiles, run:

```sql
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

### Development Setup
1. Create the profiles table using the migration
2. Set up RLS policies
3. Create the trigger function
4. Test with a new user signup

## Troubleshooting

### Common Issues

1. **Profile not created**: Check if trigger is properly set up
2. **RLS blocking access**: Verify policies are correctly configured
3. **Role not updating**: Ensure you have proper permissions to update profiles

### Debug Queries

```sql
-- Check if profiles exist for all users
SELECT u.email, p.role 
FROM auth.users u 
LEFT JOIN profiles p ON u.id = p.id;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

