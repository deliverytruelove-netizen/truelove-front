// UserModal.tsx
import React from 'react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    newUser: { name: string; email: string; usuario: string; password: string };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCreateUser: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, newUser, onChange, onCreateUser }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80 relative z-50">
                <h2 className="text-xl text-black font-semibold mb-4">Crear Usuario</h2>
                <input type="text" name="name" placeholder="Nombre" value={newUser.name} onChange={onChange} className="w-full mb-3 px-3 py-2 border rounded text-black" />
                <input type="email" name="email" placeholder="Correo" value={newUser.email} onChange={onChange} className="w-full mb-3 px-3 py-2 border rounded text-black" />
                <input type="text" name="usuario" placeholder="Usuario" value={newUser.usuario} onChange={onChange} className="w-full mb-3 px-3 py-2 border rounded text-black" />
                <input type="password" name="password" placeholder="Clave" value={newUser.password} onChange={onChange} className="w-full mb-3 px-3 py-2 border rounded text-black" />
                <div className="flex justify-end">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                    <button onClick={onCreateUser} className="bg-lime-400 text-white px-4 py-2 rounded">Crear</button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
