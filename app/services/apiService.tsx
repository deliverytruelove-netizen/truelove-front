const API_URL = 'http://localhost:8000/api';

interface PostDataParams {
    endpoint: string;
    data: any;
    token?: string;
}

export const postData = async ({ endpoint, data, token }: PostDataParams): Promise<any> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
    }

    return await response.json();
};
