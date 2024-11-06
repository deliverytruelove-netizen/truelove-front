const API_URL = 'https://magusemail.com/truelove-back/public/api';

// apiService.tsx
interface PostDataParams {
    endpoint: string;
    data: FormData;  // Cambiado a FormData
    token?: string;
}

export const postData = async ({ endpoint, data, token }: PostDataParams): Promise<Record<string, unknown>> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: data,  // Usa FormData directamente en el cuerpo de la solicitud
    });

    if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
    }

    return await response.json();
};

