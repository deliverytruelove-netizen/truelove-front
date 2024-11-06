// useLoginForm.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postData } from '../services/apiService';
import { showAlert } from '../../components/ui/DataTable/Alert';

// Cambiar el nombre de la interfaz a LoginFormData para evitar conflicto con FormData de la API web
interface LoginFormData {
    usuario: string;
    password: string;
}

export const useLoginForm = () => {
    const [formData, setFormData] = useState<LoginFormData>({ usuario: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Crea un objeto FormData usando la clase de la API web
            const formDataToSend = new FormData();
            formDataToSend.append('usuario', formData.usuario);
            formDataToSend.append('password', formData.password);

            const response = await postData({ endpoint: 'admin/login', data: formDataToSend });
            if (response) {
                showAlert({
                    title: 'Éxito',
                    text: '¡Has iniciado sesión correctamente!',
                    icon: 'success',
                    onConfirm: () => {
                        router.replace('admin/dashboard');
                    },
                });
            }
        } catch (error) {
            showAlert({
                title: 'Error',
                text: `${(error as Error).message}`,
                icon: 'error',
            });
        }
    };

    return {
        formData,
        showPassword,
        togglePasswordVisibility,
        handleChange,
        handleSubmit,
    };
};
