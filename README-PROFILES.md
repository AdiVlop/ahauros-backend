# 🎯 Ahauros Dashboard - Profiles System

## 🚀 Quick Start

### 1. Setup Supabase Database
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and paste the content from scripts/create-profiles-table.sql
# Execute the script
```

### 2. Make a User Admin (Optional)
```bash
# Go to Supabase Dashboard → SQL Editor  
# Copy and paste the content from scripts/make-user-admin.sql
# Replace 'test@ahauros.io' with your email
# Execute the script
```

### 3. Run Dashboard
```bash
cd dashboard
npm run dev
# Open http://localhost:3002
```

## 🔐 Authentication Flow

1. **Register**: User creates account → Profile automatically created
2. **Login**: User signs in → Dashboard loads with profile data
3. **Role Check**: System checks if user is admin or regular user
4. **UI Rendering**: Different UI based on role

## 👤 User Roles

### Regular User (`role: 'user'`)
- ✅ View personal dashboard
- ✅ Access user-specific features
- ✅ View analytics and settings

### Admin User (`role: 'admin'`)
- ✅ All user features
- ✅ Admin panel access
- ✅ User management tools
- ✅ System settings

## 🛠️ Development

### File Structure
```
dashboard/
├── src/
│   ├── hooks/
│   │   └── useProfile.js          # Profile data hook
│   ├── lib/
│   │   └── supabaseClient.js      # Supabase client
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   └── UserDashboard.jsx      # Main dashboard
│   └── components/
│       └── ProtectedRoute.jsx     # Route protection
├── scripts/
│   ├── create-profiles-table.sql  # Database setup
│   └── make-user-admin.sql        # Admin assignment
└── docs/
    └── PROFILES.md                # Detailed documentation
```

### Key Components

#### `useProfile` Hook
```javascript
const { profile, loading } = useProfile(userId);
// Returns: { profile: { id, email, role, created_at }, loading: boolean }
```

#### Role-Based Rendering
```javascript
const isAdmin = profile?.role === 'admin';

return (
  <div>
    {isAdmin ? <AdminPanel /> : <UserDashboard />}
  </div>
);
```

## 🗄️ Database Schema

### `profiles` Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
```

### Automatic Features
- ✅ Profile created on user signup
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own data

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup
1. Create project in Supabase
2. Run `scripts/create-profiles-table.sql`
3. Update environment variables
4. Test with user registration

## 🧪 Testing

### Test User
- **Email**: `test@ahauros.io`
- **Password**: `test123456`
- **Role**: `user` (can be changed to `admin`)

### Test Admin
1. Run `scripts/make-user-admin.sql`
2. Login with admin user
3. Verify admin panel appears

## 📱 Features

### Dashboard Features
- ✅ User information display
- ✅ Role-based UI
- ✅ Profile status
- ✅ Logout functionality
- ✅ Responsive design

### Admin Features
- ✅ User management tools
- ✅ System settings access
- ✅ Admin-only sections

## 🚨 Troubleshooting

### Common Issues

1. **Profile not loading**
   - Check if profiles table exists
   - Verify RLS policies
   - Check browser console for errors

2. **Admin features not showing**
   - Verify user role in database
   - Check `profile?.role === 'admin'` condition
   - Refresh page after role change

3. **Database connection issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Verify project is active

### Debug Steps
1. Check browser console for errors
2. Verify Supabase dashboard for data
3. Test with different user accounts
4. Check network tab for API calls

## 📚 Documentation

- **Detailed docs**: `docs/PROFILES.md`
- **Database scripts**: `scripts/` folder
- **Supabase docs**: [supabase.com/docs](https://supabase.com/docs)

## 🎉 Success!

Your Ahauros Dashboard now has:
- ✅ Complete authentication system
- ✅ Role-based access control
- ✅ User profiles with Supabase
- ✅ Admin and user dashboards
- ✅ Automatic profile creation
- ✅ Secure data access

**Ready for production!** 🚀

