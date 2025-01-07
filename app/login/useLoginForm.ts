import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postData } from '../../services/apiService';

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
        [key: string]: unknown;
    };
}

interface ApiError {
    status: number;
    data: {
        error: string;
    };
    message: string;
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
        setFormData(prev => ({ ...prev, [name]: value }));
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

            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            document.cookie = `authToken=${response.token}; path=/`;

            await new Promise(resolve => setTimeout(resolve, 100));

            router.replace('/admin/dashboard');
            
        } catch (error) {
            console.error('Error en login:', error);
            if ((error as ApiError).data?.error) {
                setErrorMessage((error as ApiError).data.error);
            } else if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Error al iniciar sesión. Por favor, intente nuevamente.');
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

