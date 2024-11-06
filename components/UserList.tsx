import React, { useState } from 'react';
import Section from '@/components/layout/Section';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, changeStateUser, createUser } from '../app/admin/usuarios/services/User.service';
import DataTable from '@/components/ui/DataTable/DataTable';
import { DebounceInput } from '@/components/ui/DataTable/DebounceInput';
import { User } from '../app/admin/usuarios/types/User.types';
import { ColumnSort, ColumnDef, Row } from '@tanstack/react-table';
import { DEFAULT_PAGE_SIZE } from '@/config/constanst';
import { FaPlus } from 'react-icons/fa';
import ConfirmationAlert from '@/components/ui/DataTable/ConfirmationAlert';
import { showAlert } from '@/components/ui/DataTable/Alert';
import UserModal from '@/components/ui/UserModal';

const UserList: React.FC = () => {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<ColumnSort[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>(''); // Filtro global
    const [pagination, setPagination] = useState({
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', usuario: '', password: '' });

    const { data: users = [], isLoading } = useQuery<User[], Error>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const mutation = useMutation({
        mutationFn: changeStateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showAlert({ title: 'Éxito', text: 'Se cambio el estado del usuario.', icon: 'success' });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                showAlert({ title: 'Error', text: error.message, icon: 'error' });
            }
        },
    });

    const handleDeactivate = (id: number) => {
        mutation.mutate(id);
    };

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showAlert({ title: 'Éxito', text: 'Usuario creado exitosamente.', icon: 'success' });
            setIsModalOpen(false);
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                showAlert({ title: 'Error', text: error.message, icon: 'error' });
            }
        },
    });

    const handleCreateUser = () => {
        createMutation.mutate(newUser);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const columns: ColumnDef<User>[] = [
        { accessorKey: 'usuario', header: () => <span className="m-auto">Usuario</span> },
        { accessorKey: 'name', header: () => <span className="m-auto">Nombre</span> },
        { accessorKey: 'email', header: () => <span className="m-auto">Correo</span> },
        {
            accessorKey: 'created_at',
            header: () => <span className="m-auto">Fecha de Creación</span>,
            cell: ({ row }: { row: Row<User> }) => formatDate(row.getValue('created_at') as string) // Formatear la fecha
        },
        {
            accessorKey: 'estado',
            header: () => <span className="m-auto">Estado</span>,
            cell: ({ row }: { row: Row<User> }) => (
                <span>{row.getValue('estado') === 1 ? 'Activo' : 'Inactivo'}</span>
            ),
        },
        {
            accessorKey: 'action', // Columna para el botón de desactivar
            header: () => <span className="m-auto">Acciones</span>,
            cell: ({ row }: { row: Row<User> }) => (
                <ConfirmationAlert
                    title="¿Estás seguro?"
                    text="¡No podrás revertir esto!"
                    onConfirm={() => handleDeactivate(row.original.id)} // Maneja la desactivación
                />
            ),
        },
    ];

    return (
        <Section title="Listado de Usuarios">
            {/* Input de búsqueda */}
            <div className="flex md:justify-end items-center px-2 lg:px-5 py-4">
                <DebounceInput
                    type="text"
                    placeholder="Buscar..."
                    className="border rounded w-100 outline-primary-400 py-2 px-3 mr-2" // Añadido 'mr-2' para el margen a la derecha
                    value={globalFilter}
                    onChange={(value) => setGlobalFilter(value)} // Actualiza el filtro global
                />
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    title="Clic aquí para deshabilitar"
                    className="bg-cyan-400 text-white flex items-center py-2 px-3 gap-2 rounded hover:bg-cyan-500/90 transition-all s3-button">
                    <FaPlus style={{ color: 'white', fontSize: '24px' }} />
                    Crear Usuario
                </button>
            </div>
            {/* Modal para crear usuario */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                newUser={newUser}
                onChange={handleInputChange}
                onCreateUser={handleCreateUser}
            />

            <div className="items-center m-auto text-center">
                {/* Componente DataTable que recibe las columnas, datos, filtro y estado de carga */}
                <DataTable
                    columns={columns}
                    data={users}
                    globalFilter={globalFilter}
                    loading={isLoading}
                    setSorting={setSorting}
                    setPagination={setPagination}
                    sorting={sorting}
                    pagination={pagination}
                />
            </div>
        </Section>
    );
};

export default UserList;
