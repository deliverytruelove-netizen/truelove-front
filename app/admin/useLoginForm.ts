// useLoginForm.ts
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter  } from 'next/navigation';
import { postData } from '../services/apiService';
import { showAlert } from '../../components/ui/DataTable/Alert';

interface FormData {
    usuario: string;
    password: string;
}

export const useLoginForm = () => {
    const [formData, setFormData] = useState<FormData>({ usuario: '', password: '' });
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
            const response = await postData({ endpoint: 'admin/login', data: formData });
            showAlert({
                title: 'Éxito',
                text: '¡Has iniciado sesión correctamente!',
                icon: 'success',
                onConfirm: () => {
                    router.replace('admin/dashboard');
                },
            });
        } catch (error) {
            showAlert({
                title: 'Error',
                text: 'Ocurrió un error al enviar el formulario.',
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
