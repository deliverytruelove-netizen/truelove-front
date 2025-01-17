'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postData, verifyEmail } from '../../../services/apiService';

interface DatosCambioContrasena {
    email: string;
    newPassword: string;
}

interface ErrorResponse {
    data?: {
        error: string;
    };
    message: string;
}

export const useCambiarContrasena = () => {
    const [formData, setFormData] = useState<DatosCambioContrasena>({
        email: '',
        newPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false
    });
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'newPassword') {
            validatePassword(value);
        }
    };

    const validatePassword = (password: string) => {
        const newValidation = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password)
        };
        setPasswordValidation(newValidation);
        return Object.values(newValidation).every(Boolean);
    };

    const handleVerifyEmail = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const response = await verifyEmail(formData.email);
            setIsEmailVerified(response.exists);
            setSuccessMessage(response.message);
        } catch (error) {
            console.error('Error al verificar el correo:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Error al verificar el correo');
            setIsEmailVerified(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!isEmailVerified) {
            setErrorMessage('Por favor, verifica tu correo primero');
            setIsLoading(false);
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            setErrorMessage('La contraseña no cumple con los requisitos');
            setIsLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('email', formData.email);
            formDataToSend.append('newPassword', formData.newPassword);

            await postData({
                endpoint: 'admin/reset-password',
                data: formDataToSend,
            });

            setSuccessMessage('Contraseña restablecida exitosamente');
            router.push('/login?reset=success');
        } catch (error) {
            console.error('Error al restablecer la contraseña:', error);
            const errorResponse = error as ErrorResponse;
            setErrorMessage(errorResponse.data?.error || errorResponse.message || 'Error al restablecer la contraseña. Por favor, intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        showPassword,
        isLoading,
        errorMessage,
        successMessage,
        togglePasswordVisibility,
        handleChange,
        handleSubmit,
        handleVerifyEmail,
        passwordValidation,
        isEmailVerified,
    };
};

