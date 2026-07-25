import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    var body = await request.json();
    var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'no service key' }, { status: 500 });
    var admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    );
    var { error } = await admin.from('posts').insert({
      user_id: body.userId || '00000000-0000-0000-0000-000000000000',
      title: (body.title || '').trim(),
      content: (body.content || '').trim(),
      category: body.category || 'chat',
      images: body.images || [],
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 });
  }
}