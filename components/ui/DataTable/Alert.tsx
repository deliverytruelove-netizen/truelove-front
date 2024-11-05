// Alert.tsx
import Swal, { SweetAlertIcon } from 'sweetalert2';

interface AlertProps {
    title: string;
    text: string;
    icon: SweetAlertIcon;
    confirmButtonText?: string;
    onConfirm?: () => void;
}

export const showAlert = ({ title, text, icon, confirmButtonText = 'OK', onConfirm }: AlertProps) => {
    Swal.fire({
        title,
        text,
        icon,
        confirmButtonText,
    }).then((result) => {
        if (result.isConfirmed && onConfirm) {
            onConfirm();
        }
    });
};
