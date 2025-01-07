const API_URL = process.env.NEXT_PUBLIC_API_WEB;


interface PostDataParams {
    endpoint: string;
    data: FormData; // Usa FormData para manejar datos de formulario
    token?: string;
}

export const postData = async <T = Record<string, unknown>>({
    endpoint,
    data,
    token,
}: PostDataParams): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }), // Agrega el token si está presente
        },
        body: data, // El cuerpo es directamente FormData
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Error en la solicitud a la API');
    }

    return await response.json();
};
