// services\apiService.tsx
const API_URL = process.env.NEXT_PUBLIC_API_WEB;

interface PostDataParams {
    endpoint: string;
    data: FormData;
    token?: string;
}

export const postData = async <T = Record<string, unknown>>({
    endpoint,
    data,
    token,
}: PostDataParams): Promise<T> => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: data,
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Error en la solicitud a la API');
            }
            return result;
        } else {
            throw new Error('La respuesta no es JSON válido');
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        throw error;
    }
};

// Nuevas funciones para las rutas adicionales

export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('newPassword', newPassword);
    
    await postData({
        endpoint: 'admin/reset-password',
        data: formData,
    });
};

export const verifyEmail = async (email: string): Promise<{ exists: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('email', email);
    
    try {
        const response = await postData<{ exists: boolean; message: string }>({
            endpoint: 'admin/verify-email',
            data: formData,
        });
        return response;
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        throw new Error('Error al verificar el correo electrónico. Por favor, intente nuevamente.');
    }
};


interface User {
    id: string;
    name: string;
    email: string;
    // Add other user properties here
}

export const checkAuth = async (): Promise<{ authenticated: boolean; user?: User; role?: string }> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return { authenticated: false };
    }

    try {
        const response = await fetch(`${API_URL}/admin/check-auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error en la verificación de autenticación');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la verificación de autenticación:', error);
        return { authenticated: false };
    }
};