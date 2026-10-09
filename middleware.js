import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/soundtracks')) {
    const token = request.cookies.get('vault_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Acceso Denegado: Sesión inexistente' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Firma de token inválida o expirada' }, { status: 403 });
    }
  }
}

export const config = {
  matcher: '/api/soundtracks',
};