import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'asdf1234!@#$';

export async function POST(request: NextRequest) {
  try {
    const { username, password, action } = await request.json();

    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: '로그아웃 되었습니다.' });
      response.cookies.delete('admin_session');
      return response;
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json({
        success: true,
        message: '로그인에 성공했습니다.',
      });

      // Set cookie for 24 hours
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: '서버 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  const isAuthenticated = session === 'authenticated';
  return NextResponse.json({ isAuthenticated });
}
