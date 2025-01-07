import { jwtVerify, SignJWT } from 'jose';

// Interfaz que define la estructura del token decodificado
interface DecodedToken {
  exp: number;                // Tiempo de expiración del token
  registration_id: string;    // ID único del registro
  current_step: string;       // Paso actual del proceso de registro
}

// Función para obtener la clave secreta
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }
  return new TextEncoder().encode(secret);
};

// Guarda el token en una cookie del navegador
export const setRegistrationToken = (token: string) => {
  document.cookie = `registrationToken=${token}; path=/; max-age=3600; SameSite=Strict; Secure`;
};

// Obtiene el token almacenado en las cookies
export const getRegistrationToken = (): string | null => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('registrationToken='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Elimina el token de las cookies
export const removeRegistrationToken = () => {
  document.cookie = 'registrationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';
};

// Verifica si el token es válido
export const isRegistrationTokenValid = async (): Promise<boolean> => {
  const token = getRegistrationToken();
  if (!token) return false;

  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
};

// Obtiene los datos decodificados del token
export const getRegistrationData = async (): Promise<DecodedToken | null> => {
  const token = getRegistrationToken();
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    
    // Verificamos que todos los campos necesarios existan y sean del tipo correcto
    if (
      typeof payload.exp === 'number' &&
      typeof payload.registration_id === 'string' &&
      typeof payload.current_step === 'string'
    ) {
      return {
        exp: payload.exp,
        registration_id: payload.registration_id,
        current_step: payload.current_step
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Crea un nuevo token de registro
export const createRegistrationToken = async (
  registration_id: string, 
  current_step: string
): Promise<string> => {
  try {
    // Creamos un nuevo token con los datos proporcionados
    const token = await new SignJWT({ 
      registration_id, 
      current_step 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(getSecretKey());
    
    // Guardamos el token en las cookies
    setRegistrationToken(token);
    return token;
  } catch (error) {
    console.error('Error al crear el token de registro:', error);
    throw error;
  }
};

// Actualiza el paso actual en el token
export const updateRegistrationStep = async (current_step: string): Promise<string | null> => {
  // Obtenemos los datos actuales del token
  const data = await getRegistrationData();
  if (!data) return null;

  // Creamos un nuevo token con el paso actualizado
  const newToken = await createRegistrationToken(data.registration_id, current_step);
  return newToken;
};

