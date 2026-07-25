import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) return NextResponse.json({ admin: false })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      key,
      { auth: { persistSession: false } }
    )

    const { data: users, error } = await supabase
      .from('users')
      .select('id, nickname, student_id, role')
      .in('role', ['admin', 'super_admin'])

    if (error) return NextResponse.json({ admin: false, error: error.message })

    return NextResponse.json({ admin: true, users })
  } catch {
    return NextResponse.json({ admin: false })
  }
}
