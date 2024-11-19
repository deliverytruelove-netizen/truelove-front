import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('authToken'); // O localStorage en el cliente

    if (token && req.nextUrl.pathname === '/admin') {
        // Redirige al dashboard si el usuario está autenticado y está en la página de login
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    return NextResponse.next(); // Continúa con la solicitud
}

// Aplica el middleware solo a estas rutas
export const config = {
    matcher: ['/admin'], // Solo aplica en /admin
};
