import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, name, bio, languages, service_areas, hourly_rate, is_available } = await req.json()

    // 1. Initialize Supabase Admin Client (using Service Role Key)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Ensure this is set in environment
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 2. Create User using Admin API (Auto-confirm email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This bypasses the verification email
      user_metadata: { name, role: 'guide' }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Failed to create user data")

    // 3. Initialize Guide Profile
    const { error: profileError } = await supabaseAdmin
      .from('guide_profiles')
      .insert([{
        user_id: authData.user.id,
        bio,
        languages,
        service_areas,
        hourly_rate,
        is_available
      }])

    if (profileError) throw profileError

    return NextResponse.json({ success: true, user: authData.user })

  } catch (error: any) {
    console.error("Admin Create Guide Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
