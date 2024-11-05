// src/components/ConfirmationAlert.tsx

import Swal, { SweetAlertIcon } from 'sweetalert2';
import { FaRegTrashAlt } from 'react-icons/fa'
interface ConfirmationAlertProps {
    title: string;
    text: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
    cancelButtonText?: string;
    onConfirm: () => void; // Función que se ejecutará al confirmar
}

const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
    title,
    text,
    icon = 'warning',
    confirmButtonText = 'Sí',
    cancelButtonText = 'Cancelar',
    onConfirm,
}) => {
    const showAlert = () => {
        Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText,
            cancelButtonText,
        }).then((result) => {
            if (result.isConfirmed) {
                onConfirm(); // Ejecuta la función onConfirm si el usuario confirma
            }
        });
    };

    return (
        <button
            onClick={showAlert}
            type="button"
            title="Clic aquí para deshabilitar"
            className="m-auto bg-primary-400 self-end md:self-auto text-white flex items-center py-2 px-3 gap-2 rounded hover:bg-primary-500/90 transition-all s3-button"
        >
            <FaRegTrashAlt style={{ color: 'white', fontSize: '24px' }} />

        </button>
    );
};

export default ConfirmationAlert;
