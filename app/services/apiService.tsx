const API_URL = 'http://truelove-back.test'; // URL de tu API

interface PostDataParams {
    endpoint: string;
    data: any; // Cambia 'any' por el tipo específico de tus datos si es posible
}

// Función para obtener el token CSRF
const getCsrfToken = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Error al obtener el token CSRF');
    }

    const csrfToken = getCookie('XSRF-TOKEN');
    console.log('Valor del CSRF Token:', csrfToken);
    return csrfToken || '';
};

// Hacer una solicitud POST
export const postData = async ({ endpoint, data }: PostDataParams): Promise<any> => {
    const csrfToken = await getCsrfToken();

    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
    }

    return await response.json();
};


// Función para obtener el valor de la cookie
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';')[0] || null;
    }
    return null;
}

