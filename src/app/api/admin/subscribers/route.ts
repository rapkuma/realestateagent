import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

function checkAuth(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  return session === 'authenticated';
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ subscribers: [], warning: 'subscribers 테이블이 아직 생성되지 않았습니다.' });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscribers: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
  }

  try {
    const { email, id } = await request.json();

    let query = supabase.from('subscribers').delete();

    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      return NextResponse.json({ error: 'ID 또는 이메일이 필요합니다.' }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '구독자가 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
