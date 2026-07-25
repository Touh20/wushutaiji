import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return NextResponse.json({ role: null, reason: 'no token' });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ role: null, reason: error?.message || 'no user' });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ role: null, reason: 'no service key' });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    );
    const { data: profile } = await admin.from('users').select('role, nickname, avatar_url').eq('id', user.id).single();

    return NextResponse.json({
      role: profile?.role || 'member',
      nickname: profile?.nickname || '',
      avatar: profile?.avatar_url || '',
    });
  } catch(e: any) {
    return NextResponse.json({ role: null, reason: e.message });
  }
}
