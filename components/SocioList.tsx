import React, { useState } from 'react';
import Section from '@/components/layout/Section';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSocios, changeStateSocio } from '@/app/admin/socios/services/Socios.service';
import DataTable from '@/components/ui/DataTable/DataTable';
import { DebounceInput } from '@/components/ui/DataTable/DebounceInput';
import { Socio } from '../app/admin/socios/types/Socios.types';
import { ColumnSort, ColumnDef, Row } from '@tanstack/react-table';
import { DEFAULT_PAGE_SIZE } from '@/config/constanst';
import ConfirmationAlert from '@/components/ui/DataTable/ConfirmationAlert';
import { showAlert } from '@/components/ui/DataTable/Alert';

const SocioList: React.FC = () => {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<ColumnSort[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>(''); // Filtro global
    const [pagination, setPagination] = useState({
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
    });

    const { data: socios = [], isLoading } = useQuery<Socio[], Error>({
        queryKey: ['socios'],
        queryFn: fetchSocios,
    });

    const mutation = useMutation({
        mutationFn: changeStateSocio,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socios'] });
            showAlert({ title: 'Éxito', text: 'Se cambio el estado del socio.', icon: 'success' });
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };



    const columns: ColumnDef<Socio>[] = [
        { accessorKey: 'name', header: () => <span className="m-auto">Usuario</span> },
        { accessorKey: 'lastName', header: () => <span className="m-auto">Nombre</span> },
        { accessorKey: 'businessType', header: () => <span className="m-auto">Nombre</span> },
        { accessorKey: 'phone', header: () => <span className="m-auto">Correo</span> },
        { accessorKey: 'email', header: () => <span className="m-auto">Correo</span> },
        {
            accessorKey: 'created_at',
            header: () => <span className="m-auto">Fecha de Creación</span>,
            cell: ({ row }: { row: Row<Socio> }) => formatDate(row.getValue('created_at') as string) // Formatear la fecha
        },
        {
            accessorKey: 'estado',
            header: () => <span className="m-auto">Estado</span>,
            cell: ({ row }: { row: Row<Socio> }) => (
                <span>{row.getValue('estado') === 1 ? 'Activo' : 'Inactivo'}</span>
            ),
        },
        {
            accessorKey: 'action', // Columna para el botón de desactivar
            header: () => <span className="m-auto">Acciones</span>,
            cell: ({ row }: { row: Row<Socio> }) => (
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
            </div>

            <div className="items-center m-auto text-center">
                {/* Componente DataTable que recibe las columnas, datos, filtro y estado de carga */}
                <DataTable
                    columns={columns}
                    data={socios}
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

export default SocioList;
