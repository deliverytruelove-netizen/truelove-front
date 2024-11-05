import React, { useState } from 'react';
import Section from '@/components/layout/Section';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, changeStateUser, createUser } from '../app/admin/usuarios/services/User.service';
import DataTable from '@/components/ui/DataTable/DataTable';
import { DebounceInput } from '@/components/ui/DataTable/DebounceInput';
import { User } from '../app/admin/usuarios/types/User.types';
import { ColumnSort, ColumnDef } from '@tanstack/react-table';
import { DEFAULT_PAGE_SIZE } from '@/config/constanst';
import { FaPlus } from 'react-icons/fa';
import ConfirmationAlert from '@/components/ui/DataTable/ConfirmationAlert';
import { showAlert } from '@/components/ui/DataTable/Alert';

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
            showAlert({ title: 'Éxito', text: 'Se cambió el estado del usuario.', icon: 'success' });
        },
        onError: (error: any) => {
            showAlert({ title: 'Error', text: error.message, icon: 'error' });
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
            setNewUser({ name: '', email: '', usuario: '', password: '' }); // Limpiar inputs después de crear usuario
        },
        onError: (error: any) => {
            showAlert({ title: 'Error', text: error.message, icon: 'error' });
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
            cell: ({ row }) => formatDate(row.getValue('created_at')) // Formatear la fecha
        },
        {
            accessorKey: 'estado',
            header: () => <span className="m-auto">Estado</span>,
            cell: ({ row }) => (
                <span>{row.getValue('estado') === 1 ? 'Activo' : 'Inactivo'}</span>
            ),
        },
        {
            accessorKey: 'action',
            header: () => <span className="m-auto">Acciones</span>,
            cell: ({ row }) => (
                <ConfirmationAlert
                    title="¿Estás seguro?"
                    text="¡No podrás revertir esto!"
                    onConfirm={() => handleDeactivate(row.original.id)}
                />
            ),
        },
    ];

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewUser({ name: '', email: '', usuario: '', password: '' }); // Limpiar inputs al cerrar modal
    };

    return (
        <Section title="Listado de Usuarios">
            <div className="flex md:justify-end items-center px-2 lg:px-5 py-4">
                <DebounceInput
                    type="text"
                    placeholder="Buscar..."
                    className="border rounded w-100 outline-primary-400 py-2 px-3 mr-2"
                    value={globalFilter}
                    onChange={(value) => setGlobalFilter(value)}
                />
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-400 text-white flex items-center py-2 px-3 gap-2 rounded hover:bg-primary-500/90 transition-all s3-button">
                    <FaPlus style={{ color: 'white', fontSize: '24px' }} />
                    Crear Usuario
                </button>
            </div>
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    style={{ zIndex: 1050 }}
                >
                    <div className="bg-white p-6 rounded shadow-lg w-80 relative z-50">
                        <h2 className="text-xl text-black font-semibold mb-4">Crear Usuario</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre"
                            value={newUser.name}
                            onChange={handleInputChange}
                            className="w-full mb-3 px-3 py-2 border rounded text-black"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo"
                            value={newUser.email}
                            onChange={handleInputChange}
                            className="w-full mb-3 px-3 py-2 border rounded text-black"
                        />
                        <input
                            type="text"
                            name="usuario"
                            placeholder="Usuario"
                            value={newUser.usuario}
                            onChange={handleInputChange}
                            className="w-full mb-3 px-3 py-2 border rounded text-black"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Clave"
                            value={newUser.password}
                            onChange={handleInputChange}
                            className="w-full mb-3 px-3 py-2 border rounded text-black"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="bg-primary-400 text-white px-4 py-2 rounded"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="items-center m-auto text-center">
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
