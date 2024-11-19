import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postData } from '../services/apiService';

interface LoginFormData {
    usuario: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: {
        id: number;
        usuario: string;
        email: string;
        [key: string]: unknown; // Otros campos opcionales en la respuesta del usuario
    };
}

// Definimos un tipo para el error esperado
interface ErrorResponse {
    response?: {
        data: {
            error: string;
        };
    };
}

export const useLoginForm = () => {
    const [formData, setFormData] = useState<LoginFormData>({ usuario: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('usuario', formData.usuario);
            formDataToSend.append('password', formData.password);

            const response = await postData<LoginResponse>({
                endpoint: 'admin/login',
                data: formDataToSend,
            });

            const { token, user } = response;

            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            router.replace('admin/dashboard');
        } catch (error: unknown) { // Cambié a 'unknown' para manejarlo de manera segura
            if (isErrorResponse(error)) {
                // Aquí accedemos de manera segura a la propiedad `error` de la respuesta
                const backendMessage = error.response?.data?.error || 'Error desconocido en el servidor';
                setErrorMessage(backendMessage);
            } else {
                setErrorMessage('Error desconocido');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        showPassword,
        isLoading,
        errorMessage,
        togglePasswordVisibility,
        handleChange,
        handleSubmit,
    };
};

// Función de verificación de tipo para errores
function isErrorResponse(error: unknown): error is ErrorResponse {
    return (
        (error as ErrorResponse).response !== undefined &&
        (error as ErrorResponse).response?.data?.error !== undefined
    );
}
