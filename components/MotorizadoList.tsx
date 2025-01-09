'use client'

import { useState } from 'react';
import { Eye, Check } from 'lucide-react'
import Section from '@/components/layout/Section';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMotorizados, changeStateMotorizado, fetchMotorizadoDetails, aprobarMotorizado } from '@/app/admin/motorizado/services/motorizado.service';
import DataTable from '@/components/ui/DataTable/DataTable';
import { DebounceInput } from '@/components/ui/DataTable/DebounceInput';
import { Button } from "@/components/ui/button"
import { Motorizado, DetallesMotorizado } from '@/app/admin/motorizado/types/motorizado.types';
import { ColumnSort, ColumnDef, Row } from '@tanstack/react-table';
import { DEFAULT_PAGE_SIZE } from '@/config/constanst';
import ConfirmationAlert from '@/components/ui/DataTable/ConfirmationAlert';
import { DetallesMotorizadoModal } from './modals/DetallesMotorizadoModal';

const MotorizadoList: React.FC = () => {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<ColumnSort[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedMotorizadoId, setSelectedMotorizadoId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        pageSize: DEFAULT_PAGE_SIZE,
        pageIndex: 0,
    });

    const { data: motorizados = [], isLoading } = useQuery<Motorizado[], Error>({
        queryKey: ['motorizados'],
        queryFn: fetchMotorizados,
    });

    const { data: detallesMotorizado } = useQuery<DetallesMotorizado | null>({
        queryKey: ['motorizado-details', selectedMotorizadoId],
        queryFn: async () => {
            if (!selectedMotorizadoId) return null;
            const data = await fetchMotorizadoDetails(selectedMotorizadoId);
            return data;
        },
        enabled: !!selectedMotorizadoId,
    });

    const mutationChangeState = useMutation({
        mutationFn: changeStateMotorizado,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['motorizados'] });
        },
    });

    const mutationAprobar = useMutation({
        mutationFn: aprobarMotorizado,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['motorizados'] });
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

    const columns: ColumnDef<Motorizado>[] = [
        { 
            accessorKey: 'nombres', 
            header: () => <span className="m-auto">Nombre</span> 
        },
        { 
            accessorKey: 'apellidos', 
            header: () => <span className="m-auto">Apellidos</span> 
        },
        { 
            accessorKey: 'celular', 
            header: () => <span className="m-auto">Teléfono</span> 
        },
        { 
            accessorKey: 'email', 
            header: () => <span className="m-auto">Correo</span> 
        },
        {
            accessorKey: 'documento',
            header: () => <span className="m-auto">Documento</span>,
            cell: ({ row }) => `${row.original.tipo_documento}: ${row.original.nro_documento}`
        },
        {
            accessorKey: 'created_at',
            header: () => <span className="m-auto">Fecha de Registro</span>,
            cell: ({ row }) => formatDate(row.getValue('created_at'))
        },
        {
            accessorKey: 'estado',
            header: () => <span className="m-auto">Estado</span>,
            cell: ({ row }) => (
                <span>{row.original.estado ? 'Activo' : 'Inactivo'}</span>
            ),
        },
        {
            accessorKey: 'aprobado',
            header: () => <span className="m-auto">Aprobado</span>,
            cell: ({ row }) => (
                <span>{row.original.aprobado ? 
                    <Check className="text-green-500 mx-auto" /> : 
                    <span className="text-red-500">Pendiente</span>
                }</span>
            ),
        },
        {
            accessorKey: 'action',
            header: () => <span className="m-auto">Acciones</span>,
            cell: ({ row }: { row: Row<Motorizado> }) => (
                <div className="flex gap-2 justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSelectedMotorizadoId(row.original.id);
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
        <Section title="Listado de Motorizados">
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
                    data={motorizados}
                    globalFilter={globalFilter}
                    loading={isLoading}
                    setSorting={setSorting}
                    setPagination={setPagination}
                    sorting={sorting}
                    pagination={pagination}
                />
            </div>

            <DetallesMotorizadoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMotorizadoId(null);
                }}
                data={detallesMotorizado}
                onAprobar={handleAprobar}
            />
        </Section>
    );
};

export default MotorizadoList;