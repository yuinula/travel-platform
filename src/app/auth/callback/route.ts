import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') // Get the role from query params
  const next = searchParams.get('next') ?? (role === 'guide' ? '/dashboard' : '/explore')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If we have a role, update the user metadata if it doesn't exist
      if (role) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && !user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: { role: role }
          })
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?message=Could not authenticate user`)
}
