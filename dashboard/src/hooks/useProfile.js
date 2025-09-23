import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        // Try to get profile from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (!error && data) {
          setProfile(data)
        } else {
          // If no profile exists or table doesn't exist, create a default one
          console.log('No profile found, creating default profile for user:', userId)
          
          // Get user email from session to determine role
          const { data: { user } } = await supabase.auth.getUser()
          const isAdmin = user?.email === 'admin@ahauros.io'
          
          setProfile({
            id: userId,
            email: user?.email || null,
            role: isAdmin ? 'admin' : 'user', // Admin role for admin@ahauros.io
            created_at: new Date().toISOString()
          })
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        // Fallback to default profile
        const { data: { user } } = await supabase.auth.getUser()
        const isAdmin = user?.email === 'admin@ahauros.io'
        
        setProfile({
          id: userId,
          email: user?.email || null,
          role: isAdmin ? 'admin' : 'user', // Admin role for admin@ahauros.io
          created_at: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [userId])

  return { profile, loading }
}

