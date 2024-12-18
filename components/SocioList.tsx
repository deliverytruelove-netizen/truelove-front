'use client'

import { useState } from 'react';
import { Eye, Check } from 'lucide-react'
import Section from '@/components/layout/Section';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSocios, changeStateSocio, fetchSocioDetails, aprobarSocio } from '@/app/admin/socios/services/Socios.service';
import DataTable from '@/components/ui/DataTable/DataTable';
import { DebounceInput } from '@/components/ui/DataTable/DebounceInput';
import { Button } from "@/components/ui/button"
import { Socio, DetallesSocio } from '@/app/admin/socios/types/Socios.types';
import { ColumnSort, ColumnDef, Row } from '@tanstack/react-table';
import { DEFAULT_PAGE_SIZE } from '@/config/constanst';
import ConfirmationAlert from '@/components/ui/DataTable/ConfirmationAlert';
import { showAlert } from '@/components/ui/DataTable/Alert';
import { DetallesSocioModal } from './modals/DetallesSocioModal';

const SocioList: React.FC = () => {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<ColumnSort[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedSocioId, setSelectedSocioId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
    });

    const { data: socios = [], isLoading } = useQuery<Socio[], Error>({
        queryKey: ['socios'],
        queryFn: fetchSocios,
    });

    const { data: detallesSocio } = useQuery<DetallesSocio | null>({
        queryKey: ['socio-details', selectedSocioId],
        queryFn: async () => {
            if (!selectedSocioId) return null;
            const data = await fetchSocioDetails(selectedSocioId);
            return data;
        },
        enabled: !!selectedSocioId,
    });

    const mutationChangeState = useMutation({
        mutationFn: changeStateSocio,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socios'] });
            showAlert({ title: 'Éxito', text: 'Se cambió el estado del socio.', icon: 'success' });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                showAlert({ title: 'Error', text: error.message, icon: 'error' });
            }
        },
    });

    const mutationAprobar = useMutation({
        mutationFn: aprobarSocio,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['socios'] });
            // refetchDetalles(); No longer needed since we don't have the refetchDetalles variable anymore.
            showAlert({ title: 'Éxito', text: 'Se aprobó el socio.', icon: 'success' });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) {
                showAlert({ title: 'Error', text: error.message, icon: 'error' });
            }
        },
    });

    const handleDeactivate = (id: number) => {
        mutationChangeState.mutate(id);
    };

    const handleAprobar = (id: number) => {
        mutationAprobar.mutate(id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const columns: ColumnDef<Socio>[] = [
        { accessorKey: 'name', header: () => <span className="m-auto">Usuario</span> },
        { accessorKey: 'lastName', header: () => <span className="m-auto">Apellidos</span> },
        { accessorKey: 'businessType', header: () => <span className="m-auto">Tipo de Negocio</span> },
        { accessorKey: 'phone', header: () => <span className="m-auto">Teléfono</span> },
        { accessorKey: 'email', header: () => <span className="m-auto">Correo</span> },
        {
            accessorKey: 'created_at',
            header: () => <span className="m-auto">Fecha de Creación</span>,
            cell: ({ row }) => formatDate(row.getValue('created_at'))
        },
        {
            accessorKey: 'estado',
            header: () => <span className="m-auto">Estado</span>,
            cell: ({ row }) => (
                <span>{row.getValue('estado') === 1 ? 'Activo' : 'Inactivo'}</span>
            ),
        },
        {
            accessorKey: 'aprobado',
            header: () => <span className="m-auto">Aprobado</span>,
            cell: ({ row }) => (
                <span>{row.getValue('aprobado') ? 
                    <Check className="text-green-500 mx-auto" /> : 
                    <span className="text-red-500">Pendiente</span>
                }</span>
            ),
        },
        {
            accessorKey: 'action',
            header: () => <span className="m-auto">Acciones</span>,
            cell: ({ row }: { row: Row<Socio> }) => (
                <div className="flex gap-2 justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSelectedSocioId(row.original.id);
                            setIsModalOpen(true);
                        }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <ConfirmationAlert
                        title="¿Estás seguro?"
                        text="¡No podrás revertir esto!"
                        onConfirm={() => handleDeactivate(row.original.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <Section title="Listado de Socios">
            <div className="flex md:justify-end items-center px-2 lg:px-5 py-4">
                <DebounceInput
                    type="text"
                    placeholder="Buscar..."
                    className="border rounded w-100 outline-primary-400 py-2 px-3 mr-2"
                    value={globalFilter}
                    onChange={(value) => setGlobalFilter(value)}
                />
            </div>

            <div className="items-center m-auto text-center">
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

            <DetallesSocioModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSocioId(null);
                }}
                data={detallesSocio}
                onAprobar={handleAprobar}
            />
        </Section>
    );
};

export default SocioList;

