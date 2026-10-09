import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Rate limiter en memoria para control de fuerza bruta por IP
const rateLimit = new Map();

// Base de datos simulada con el HASH ESTÁTICO CORRECTO que acabamos de obtener
const usersDB = [
  {
    email: 'kenny@vault.com',
    // Tu hash real generado para la contraseña que utilizaste
    passwordHash: '$2b$10$/wphfNqAofjOntjK8p2n5uvcH4s4t8Be5FYnJEVRL.d3O0/illhim',
    role: 'VIP'
  }
];

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRecord = rateLimit.get(ip) || { attempts: 0, blockedUntil: 0 };

    // 1. Verificar si la IP está bloqueada temporalmente por exceso de intentos
    if (Date.now() < limitRecord.blockedUntil) {
      return NextResponse.json({ error: 'IP Bloqueada temporalmente por seguridad.' }, { status: 429 });
    }

    const { email, password } = await request.json();

    // 2. Buscar al usuario en la base de datos
    const user = usersDB.find(u => u.email === email);

    // 3. Validación criptográfica eficiente (Compara el texto plano con el hash estático guardado)
    const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!isValid) {
      limitRecord.attempts += 1;
      if (limitRecord.attempts >= 5) {
        // Bloqueo por 15 minutos tras 5 fallos
        limitRecord.blockedUntil = Date.now() + 15 * 60 * 1000;
      }
      rateLimit.set(ip, limitRecord);
      
      // Respuesta genérica para evitar filtración de usuarios registrados
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Éxito: Limpiamos los intentos fallidos de la IP
    rateLimit.delete(ip);

    // 4. Firmar el JSON Web Token (JWT) de la sesión
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET || 'llave_secreta_desarrollo',
      { expiresIn: '1h' }
    );

    const response = NextResponse.json({ success: true });

    // 5. Inyectar la Cookie Segura HttpOnly (Blindaje contra XSS)
    response.cookies.set({
      name: 'vault_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600
    });

    return response;

  } catch (error) {
    console.error("Error crítico en autenticación:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}