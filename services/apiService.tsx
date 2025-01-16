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