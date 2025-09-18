
'use client';

import React from 'react';
import MainLayout from '../components/MainLayout';
import KilometrosTarifaList from '@/components/KilometrosTarifaList';

const KilometrosTarifa: React.FC = () => {
    return (
        <MainLayout>
            <KilometrosTarifaList />
        </MainLayout>
    );
};

export default KilometrosTarifa;
